# CLAUDE.md — Organiza meu Casamento

SaaS de planejamento de casamento em português do Brasil. Nome do produto
("Organiza meu Casamento", trocado do nome provisório "Meu Casamento" na
Fase 16) isolado em `src/lib/site.ts` (constante `NOME_PRODUTO`) para trocar
em um lugar só se mudar de novo.

Usuária principal: a noiva. Ela convida noivo, familiares, madrinhas/padrinhos
e cerimonialista para colaborar no planejamento (ver `wedding_members`).

## Stack

- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS v4 + shadcn/ui (CLI nova geração — ver decisão abaixo)
- Supabase: Postgres, Auth, Storage, RLS
- Drizzle ORM + drizzle-kit
- React Hook Form + Zod
- date-fns (locale pt-BR)
- recharts (gráficos)
- dnd-kit (drag-and-drop)
- Deploy: Vercel

## Convenções

- Toda a interface em português do Brasil. Nenhuma string visível em inglês.
- Moeda: `formatCurrency` de `src/lib/format.ts` (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`). Inputs de dinheiro sempre com máscara.
- Datas: `formatDate` → `dd/MM/yyyy`. Horários em 24h, sempre `HH:mm`.
- Mobile-first em todas as telas da área logada e do site público.
- Server Components por padrão. `'use client'` só quando há interatividade real (formulário, drag-and-drop, estado local, listeners do browser).
- Mutações **sempre** via Server Actions em `src/actions/<modulo>.ts`, com validação Zod no servidor. O cliente nunca é fonte de verdade.
- Sem `localStorage` para dados de negócio (rascunho de onboarding vive no banco, não no browser).
- Um componente por arquivo, componentes pequenos.
- Sem comentários óbvios no código — comentar só decisão não óbvia.
- Todo acesso a dado de negócio passa por RLS (ver "Acesso a dados" abaixo). Nunca importar a service key no código do app.
- Enums de domínio (categoria de tarefa/fornecedor, papel, permissão, etc.) vivem em `src/db/schema` como `pgEnum` e são reexportados para uso em formulários/labels — não duplicar a lista em outro lugar.

## Estrutura de pastas

```
src/
├── app/
│   ├── (marketing)/          landing, preços, legais
│   ├── (auth)/               entrar, cadastro, senha
│   ├── (app)/app/            área logada
│   ├── c/[slug]/             site público do casal
│   └── convite/[token]/
├── components/
│   ├── ui/                   shadcn
│   ├── app/                  componentes da área logada
│   └── marketing/
├── lib/                      utils, formatters (format.ts), validators, supabase/
├── db/                       schema, migrations, seed, queries, rls.ts
└── actions/                  server actions por módulo
```

`/inicio` (wizard de onboarding) fica fora de `(app)/app` propositalmente —
é o único trecho logado acessível sem wedding cadastrado.

## Acesso a dados: Drizzle + RLS do Supabase

Decisão de arquitetura (irreversível, registrada aqui): o app usa **dois**
clientes Drizzle, nunca a service key:

1. `src/db/index.ts` (`db`) — conexão direta com `DATABASE_URL`. Uso
   restrito a `drizzle-kit` (migrations) e `src/db/seed.ts`. **Nunca** importar
   em código que atende requisição de usuário — a role de conexão não tem as
   políticas de RLS aplicadas da mesma forma que a role `authenticated`.
   Duas exceções pontuais, ambas documentadas em "Fase 14 — Pagamentos via
   Stripe": o webhook do Stripe (sem sessão de usuária pra passar por
   `rls()`) e a escrita de `profiles.stripeCustomerId` (coluna com UPDATE
   revogado da role `authenticated` de propósito).
2. `src/db/rls.ts` (`createDrizzleSupabaseClient().rls(callback)`) — uso em
   toda Server Action e Server Component que lê/grava dado do casamento. Abre
   uma transação Postgres, aplica `set_config('request.jwt.claims', ...)` e
   `set local role authenticated|anon` a partir da sessão do Supabase Auth, e
   só então roda a query — as políticas de RLS do Postgres valem exatamente
   como valeriam via PostgREST. Isso permite usar Drizzle (schema tipado,
   queries relacionais) sem abrir mão de RLS nem tocar na service key.

Toda função em `src/db/queries/*` recebe esse client já aberto (ou abre um
internamente) — nunca importa `db` de `src/db/index.ts` para servir dado de
usuário.

`rls(callback, contexto?)` aceita um segundo argumento opcional
`{ guestCode?, inviteToken? }`, setado via `set_config` na mesma transação,
usado pelas duas policies públicas que não dependem de login (RSVP por
código em `guests` e aceite de convite por token em `wedding_members` — ver
"RLS — regras por tabela" abaixo).

**Bug real encontrado só ao conectar num Postgres de verdade** (as Fases
1–9 foram construídas e revisadas sem nenhum banco conectado — não havia
credenciais ainda): o `rls()` original mandava `set_config(...); set_config(...);
...; set local role ...;` como uma única query com `;` separando os
comandos. Isso quebra porque o protocolo estendido do Postgres (usado
sempre que a query tem parâmetro vinculado, como os `${valor}` do template)
não aceita mais de um comando por vez — dava
`cannot insert multiple commands into a prepared statement`,
só em `authenticated`/`anon` (não afetava o client admin de
`src/db/index.ts`, que não passa por `rls()`). Corrigido separando cada
`set_config`/`set local role` em uma chamada própria a `tx.execute`. De
brinde, o `finally` que tentava "desfazer" as claims no fim da transação
também foi removido: com `true` (is_local) e "local", elas já revertem
sozinhas no commit/rollback — e mantê-lo mascarava o erro real de qualquer
query que desse errado (a transação já abortada fazia a query de limpeza
falhar por cima, escondendo a causa). Moral: sem um banco real conectado,
build/typecheck/lint não pegam bug de protocolo SQL — vale testar contra o
Postgres de verdade assim que houver credenciais.

## Modelo de dados (Fase 2)

Schema completo em `src/db/schema/*` (um arquivo por tabela/domínio, ver
`index.ts` para a lista). Cada tabela usa `pgPolicy` do próprio Drizzle
(`drizzle-orm/pg-core`) para declarar RLS junto da definição da tabela — as
migrations em `src/db/migrations/*.sql` são geradas a partir daí
(`npm run db:generate`).

### RLS — regras por tabela

- **Regra base (todas as tabelas "filhas" de `weddings`)**: leitura para
  quem é dona (`weddings.owner_id`) ou membro com `convite_aceito_em`
  preenchido (qualquer `permissao`); escrita (insert/update/delete) exige
  `permissao` `admin` ou `editor` — `leitor` só lê. Implementado em
  `src/db/schema/policy-helpers.ts` (`standardWeddingPolicies`), que usa duas
  funções Postgres `security definer` criadas na migration
  `0001_rls_policies_and_storage.sql`: `public.is_wedding_member(wedding_id)`
  e `public.can_edit_wedding(wedding_id)`. `security definer` é necessário
  para evitar recursão de RLS entre `weddings`/`wedding_members` (a função
  roda como dona das tabelas, que ignora RLS por ser a "table owner").
- **`weddings`**: leitura para membros via `is_wedding_member(id)`; update
  restrito a `is_wedding_admin(id)` (dona ou membro `admin` — mais restrito
  que "editor" porque inclui publicar/despublicar e excluir dados);
  delete só pela dona. Leitura pública (`anon`) quando `publicado = true`,
  mas só nas colunas de vitrine — ver "Grants de coluna" abaixo.
- **`wedding_members`**: gestão de equipe (insert/update/delete) restrita a
  quem é `is_wedding_admin`. Ver e aceitar o próprio convite não depende de
  já estar logada nem de já ter `user_id`: a policy compara
  `convite_token` com `current_setting('request.invite_token', true)`, que o
  Server Action de `/convite/[token]` seta via `rls(cb, { inviteToken })`.
- **`guests`**: CRUD normal para a equipe do casamento; RSVP público (sem
  login) via `codigo_rsvp = current_setting('request.guest_code', true)`,
  setado por `rls(cb, { guestCode })` a partir do código que a pessoa
  convidada digita em `/c/[slug]/confirmar`.
- **`gifts`**: CRUD normal para a equipe; leitura e reserva pública quando
  `weddings.publicado = true` (join direto na policy, sem variável de
  sessão — não há "código" aqui, é público mesmo).
- **`profiles`**: cada usuária vê e edita o próprio perfil, e também vê o
  perfil de quem participa de algum casamento em comum (para listas de
  "responsável", equipe etc.).

### Grants de coluna para `anon`

Por padrão o Supabase concede privilégios amplos de tabela a `anon` e
`authenticated` no schema `public` e deixa toda a autorização por conta da
RLS — mas RLS filtra **linhas**, não colunas. Como `weddings`, `guests` e
`gifts` têm policies que liberam `anon` em parte dos dados, a migration
`0001_rls_policies_and_storage.sql` faz `revoke all ... from anon` seguido de
`grant select/update (colunas específicas)` nessas 3 tabelas (+ leitura do
convite por token em `wedding_members`), garantindo que endereço/orçamento
de `weddings`, e-mail/telefone de outros convidados em `guests`, e o e-mail
de quem reservou em `gifts` nunca vazem para o público mesmo que a regra de
linha permita ver aquela linha.

### Storage

4 buckets criados na mesma migration: `capas` e `presentes` são **públicos**
(a página `/c/[slug]` precisa exibi-los sem autenticação); `inspiracoes` e
`documentos` são privados à equipe do casamento. Convenção de path:
`{wedding_id}/arquivo.ext` — as policies de `storage.objects` extraem o
`wedding_id` do 1º segmento via `storage.foldername(name)` e reusam
`is_wedding_member`/`can_edit_wedding`.

### Seed

`npm run db:seed` (`src/db/seed.ts`) usa a Admin API do Supabase
(`SUPABASE_SERVICE_ROLE_KEY`, só neste script local) para criar a usuária de
demonstração `mariana@exemplo.com` / `SenhaDemo123!`, depois popula um
casamento completo com o client administrativo (`src/db/index.ts`) — inclui
o checklist real de 68 tarefas da Fase 3 (reaproveitado aqui só como dado de
seed; a lógica oficial de geração no onboarding é implementada na Fase 3).

## Decisões registradas (spec ambígua → opção mais simples)

- **Nome do produto**: "Organiza meu Casamento" (trocado de "Meu Casamento"
  na Fase 16, ver seção própria) isolado em `src/lib/site.ts`.
- **shadcn/ui**: CLI atual gera o preset "nova" sobre a base **Radix**
  (`npx shadcn@latest init -b radix -p nova`) em vez do preset "base-nova"
  (Base UI) — Radix é o ecossistema mais maduro/documentado para os
  componentes que este projeto usa bastante (dialog, dropdown, tabs, sheet).
  O componente `form.tsx` do registry novo não integra com React Hook Form
  (vira "field"); mantivemos manualmente o `form.tsx` clássico
  (Controller + Context) compatível com RHF + Zod.
- **Fontes**: título serifado = Fraunces, corpo = Inter, ambas via
  `next/font/google` (self-hosted pelo Next, sem chamada externa em runtime).
- **Paleta**: tokens definidos uma única vez em `src/app/globals.css`
  (off-white `#faf8f3`, areia `#f0ebde`/`#e2dbc8`, verde-oliva `#6f7350` como
  única cor de destaque, texto chumbo `#33322d`). `--radius` pequeno
  (0.25rem). Sem gradiente, sem sombra pesada, sem glassmorphism **na área
  logada** — a landing/marketing pública ganhou uma exceção pontual na
  Fase 15 (gradiente suave no hero, `shadow-sm`/`shadow-lg` leves em card),
  ver "Fase 15 — Rebranding da landing page".
- **Redirecionamento /inicio vs /app**: o middleware (`src/lib/supabase/middleware.ts`)
  só cuida de autenticado x não autenticado. A checagem "tem wedding
  cadastrado?" roda no layout de `(app)/app` (Server Component, via
  `src/db/rls.ts`), porque depende de uma query ao banco — mantém o
  middleware leve.
- **Onboarding sem localStorage**: cada passo do wizard `/inicio` salva no
  banco (rascunho em `weddings` ou tabela de rascunho) — ver decisão detalhada
  quando a Fase 3 for implementada.
- **Papel "admin" vs "editor" em `wedding_members`**: `editor` pode
  criar/editar/excluir conteúdo de qualquer módulo (tarefas, orçamento,
  convidados etc.); ações estruturais — publicar/despublicar o site,
  editar dados de `weddings`, convidar/revogar membros da equipe — exigem
  `admin`. A dona (`owner_id`) sempre tem acesso total, mesmo sem linha em
  `wedding_members`.
- **`auth.users` no schema Drizzle**: usamos o helper oficial
  `drizzle-orm/supabase` (`authUsers`, `authUid`, `authenticatedRole`,
  `anonRole`) em vez de declarar a tabela à mão. Como o `drizzle-kit
generate` tentaria criar essa tabela (ela só existe de fato porque o
  Supabase Auth já a gerencia), a migration `0000` teve o `CREATE TABLE
"auth"."users"` removido manualmente — só a referência via FK fica. Se
  algum dia rodar `drizzle-kit generate` de novo a partir do zero, repita
  essa remoção antes de aplicar a migration.
- **Trigger `handle_new_user`**: toda conta criada no Supabase Auth ganha
  automaticamente uma linha em `profiles` (nome vindo de
  `user_metadata.nome` ou do prefixo do e-mail) — feito na migration
  `0001`, não depende do código da aplicação.
- **Onboarding = uma linha em `weddings` desde o passo 1**: como
  `slug` é `NOT NULL UNIQUE`, o rascunho já nasce com um slug definitivo
  (nomes + sufixo aleatório de 4 caracteres, com retry em caso de colisão)
  em vez de esperar o passo 5 — o slug pode ser trocado depois em
  Configurações (Fase 7). "Onboarding concluído" é `weddings.estilo IS NOT
NULL` (sem coluna extra): é o campo do último passo, e só depois dele
  o app gera categorias de orçamento e checklist.
- **Cada passo do wizard é uma rota própria** (`/inicio/nomes`,
  `/inicio/data`, `/inicio/convidados`, `/inicio/orcamento`,
  `/inicio/estilo`), cada uma um Server Component que busca o rascunho via
  `getMinhaWedding()` e redireciona para o passo anterior faltante se a
  pessoa tentar pular etapa — sem estado de wizard no cliente.
- **Reset de senha**: o link do e-mail aponta para
  `/auth/callback?next=/redefinir-senha`; o callback troca o código PKCE por
  sessão e só então redireciona. Por isso `/redefinir-senha` é a única rota
  de auth que o middleware **não** redireciona para `/app` quando já
  autenticado (as outras sim, para não deixar quem já tem conta ver
  `/entrar` de novo).
- **`getMinhaWedding` com `React.cache`**: layout de `(app)/app`, a página
  do dashboard e qualquer Server Component que precise do casamento atual
  chamam a mesma função — `cache()` garante uma única query por requisição
  em vez de repetir a leitura em cada camada.
- **Navegação em `src/lib/nav-items.ts`**: lista única usada pela sidebar
  (desktop) e pelo menu mobile (bottom nav + drawer "Mais") — os links já
  apontam para as rotas dos módulos das Fases 5–7, que ainda não existem;
  até lá dão 404 de propósito (a estrutura de navegação é entregue completa
  na Fase 4, o conteúdo de cada módulo vem depois).
- **Dashboard sem N+1**: `src/db/queries/dashboard.ts` roda todas as
  agregações (checklist, orçamento, RSVP, alertas, próximas tarefas) dentro
  de uma única chamada a `rls()` — nenhuma delas itera por linha do lado do
  app, são somas/contagens agregadas no Postgres.
- **Edição inline de valores (orçamento)**: `InlineCurrencyEditor`
  (`src/components/app/inline-currency-editor.tsx`) é reaproveitado tanto no
  valor previsto da categoria quanto no previsto/contratado de cada item —
  clique para editar, `Enter`/botão salva via Server Action, sem modal.
  Categoria fica em destaque (`text-destructive`) quando o contratado da
  categoria ou de um item ultrapassa o previsto correspondente.
- **CSV client-side**: exportar pagamentos gera o CSV no navegador (Blob +
  link temporário) a partir dos dados já carregados — não existe rota de
  export no servidor, evita ida e volta extra e mantém a lista de
  pagamentos como única fonte de verdade.
- **Contrato de fornecedor**: upload direto do navegador para o bucket
  privado `documentos` (via client Supabase, respeitando as policies de
  Storage da Fase 2), e o Server Action só grava a linha em `documents`
  com o **caminho** do arquivo — como o bucket é privado, a visualização
  gera uma signed URL sob demanda (`obterUrlAssinadaDocumento`) em vez de
  guardar uma URL pública. `src/actions/documents.ts` já nasce genérico
  (não amarrado a fornecedor) para a Fase 7 (`/app/documentos`) reaproveitar.
- **"Criar item de orçamento" ao contratar fornecedor**: é uma etapa dentro
  do próprio formulário do fornecedor (checkbox + seleção de categoria),
  não um fluxo separado — evita um segundo modal para uma ação opcional.
- **CSV genérico**: `src/lib/csv.ts` (parse + montagem + download) é
  compartilhado entre exportar pagamentos (Fase 5) e importar convidados
  (Fase 6) — parser próprio (aspas/vírgula/CRLF) em vez de dependência nova,
  suficiente para o uso interno da ferramenta.
- **Importação de convidados**: cabeçalho aceito é só
  `nome,email,telefone,grupo,lado,acompanhantes` (em português, minúsculo);
  linhas sem "nome" são ignoradas. `codigo_rsvp` é sempre gerado no servidor
  (nunca vem do CSV), com o mesmo padrão de retry-em-colisão usado no slug
  do casamento (Fase 3).
- **Link de convite e mensagem de WhatsApp**: o link aponta para
  `/c/[slug]/confirmar?codigo=...` (página pública da Fase 8, ainda não
  existe — o botão já funciona, a rota fica de propósito 404 até lá, mesma
  lógica dos itens de navegação da Fase 4). Copiar usa
  `navigator.clipboard`, sem gerar nem enviar nada pelo servidor.
- **Editor de mesas com dnd-kit**: convidado confirmado sem mesa é
  arrastável (`guest:<id>`) para dentro de uma mesa (`table-drop:<id>`) ou
  de volta para a lista lateral (`sem-mesa`) — a atribuição em si sempre
  usa clique num "×" (não arrasto) para tirar alguém de uma mesa, mais
  simples e sem ambiguidade de gesto. Mesas são arrastáveis pela própria
  faixa de título (`table-drag:<id>`) para reposicionar; **redimensionar**
  é feito editando a capacidade no formulário (a caixa da mesa cresce
  proporcionalmente), não por alça de resize visual.
- **Exportar mapa de mesas em PDF**: usa `window.print()` com classes
  `print:hidden` na sidebar/bottom nav/header em vez de uma lib de PDF nova
  — a pessoa usa "Salvar como PDF" do diálogo de impressão do navegador.
  Mesmo componente (`components/app/export-pdf-button.tsx`) reaproveitado no
  cronograma e em `/app/exportar`.
- **Cronograma — horário calculado, não digitado**: só o primeiro bloco tem
  horário editável; os demais são `dataCasamento_do_primeiro + soma das
durações anteriores`, recalculado e regravado em todas as linhas
  (`recalcularHorarios` em `src/actions/timeline.ts`) a cada criação, edição
  de duração ou reordenação por drag (dnd-kit sortable). O componente de
  lista mantém uma cópia local só para refletir o novo horário na hora,
  sincronizada com os props via `useEffect` sempre que o Server Component
  revalida.
- **Buckets privados (`inspiracoes`, `documentos`) exigem signed URL**: como
  não são públicos, toda leitura de imagem/arquivo passa por
  `src/actions/storage.ts` (`obterUrlAssinada`/`obterUrlsAssinadas`, esta
  última em lote via `createSignedUrls`) usando o client comum do Supabase
  Auth — não o `rls()` do Postgres, que não fala com Storage. Buckets
  públicos (`presentes`, `capas`) guardam a URL pública direto, sem essa
  etapa.
- **JSONB de lua de mel editado por índice**: `roteiro` e `checklist_mala`
  são arrays JSONB únicos (Fase 2); adicionar/remover item lê o array
  inteiro, modifica e regrava (sem tabela própria) — aceitável porque só a
  dona edita, sem concorrência real.
- **Equipe e convite**: convidar/revogar/mudar permissão exigem
  `is_wedding_admin` (a policy de RLS já barra quem não é admin — a Server
  Action só precisa tratar o erro). Aceitar convite
  (`src/actions/members.ts#aceitarConvite`) roda `rls(callback,
{ inviteToken })` batendo exatamente na policy
  `wedding_members_aceitar_convite` da Fase 2. `/convite/[token]` é pública
  (fora do grupo `(app)`) e mostra "Entrar"/"Criar conta" com
  `?redirecionar=/convite/[token]` quando ninguém está logada — por isso
  `entrar`/`cadastrar` (Fase 3) ganharam um segundo parâmetro
  `redirecionarPara`, validado como caminho relativo para não virar open
  redirect.
- **Exclusão de conta sem service key**: migration `0002_excluir_conta.sql`
  cria `public.excluir_minha_conta()` `security definer` que roda
  `delete from auth.users where id = auth.uid()` — a usuária autenticada
  chama via `supabase.rpc(...)`, nunca precisamos da service key no app. O
  cascade das FKs (Fase 2) apaga o resto: se é dona, o casamento inteiro
  some; se é só membro, some só a própria conta e o próprio vínculo.
- **Slug em Configurações não usa sufixo aleatório**: diferente do slug
  gerado no onboarding (Fase 3), aqui a pessoa escolhe o endereço; em caso
  de colisão o Server Action devolve "esse endereço já está em uso" (mesmo
  código `23505`) em vez de tentar de novo com outro sufixo.
- **`/app/exportar` entrou na navegação da Fase 4** (`src/lib/nav-items.ts`)
  mesmo não estando na lista original daquela fase — só existe conteúdo
  para exportar a partir desta fase, então o item de menu foi adicionado
  junto com a página.
- **Busca por nome em `/c/[slug]/confirmar`**: a RLS de `guests` só libera
  `anon` por código exato — não existe policy de "buscar por nome" porque
  isso exigiria dar visibilidade de linha antes de qualquer prova de
  identidade. Resolvido com uma função `security definer`
  (`public.buscar_convidados_publico`, migration 0003) que devolve só
  `{id, nome, codigo_rsvp}` de casamentos publicados; o fluxo usa esse
  código para seguir pela policy normal de RSVP.
- **Página pública só é visível com `publicado = true`, sem modo de
  pré-visualização para a dona** — segue a spec ao pé da letra ("acessível
  apenas com publicado = true"); se um dia quiserem que a dona veja a
  própria página antes de publicar, é uma exceção a adicionar depois, não
  implementada agora.
- **Visitante autenticado de outro casamento não vê a vitrine pública**: a
  policy `weddings_select_vitrine_publica` (Fase 2) só libera `anon`, não
  `authenticated` — alguém logado que não é dona nem membro daquele
  casamento recebe 404 em vez da vitrine. Corrigir isso exigiria uma view
  `security definer` separada só para essa combinação rara (visitante
  logado + casamento de outra pessoa); optamos por não criar essa segunda
  via de acesso — o caso comum (visitante deslogado) e o caso da própria
  equipe (via `weddings_select_membros`) já funcionam.
- **Queries públicas sempre limitam `columns`**: como o grant de coluna de
  `anon` (Fase 2) só libera um subconjunto de `weddings`/`guests`/`gifts`,
  `src/db/queries/public-site.ts` sempre passa `columns: {...}` explícito
  nessas tabelas — pedir uma coluna fora da lista faz a query falhar com
  "permission denied" quando quem olha a página não está logada.
- **Mapa embutido sem chave de API**: `/c/[slug]/local` usa
  `https://www.google.com/maps?q=...&output=embed`, que não exige API key
  nem variável de ambiente — suficiente para mostrar a localização, sem
  gerenciar credenciais do Google Maps.
- **Preço é placeholder**: o modelo de negócio (noiva = pagamento único;
  cerimonialista = 3 planos mensais) foi decidido na Fase 13, mas os
  valores em si (`src/lib/planos.ts`) são fictícios — nunca validados com
  o mercado, precisam ser substituídos antes do lançamento de verdade. Ver
  "Fase 13 — Planos e preços" para o racional completo.
- **Favicon/ícones gerados por código**: `src/app/icon.tsx` e
  `apple-icon.tsx` usam `next/og` (`ImageResponse`) para desenhar um
  monograma ("O", de `NOME_PRODUTO` — trocado de "M" pra "O" na Fase 16
  junto com o nome do produto) na cor de destaque, em vez de depender de
  um arquivo de imagem pronto — não há nenhum arquivo de design disponível
  ainda. Uma versão com desenho de aliança (dois círculos aninhados) foi
  tentada e revertida na mesma fase — a dona achou o monograma de letra
  melhor. Troque por um ícone de verdade quando a identidade visual for
  definida.
- **Sitemap inclui casamentos publicados**: `src/app/sitemap.ts` consulta
  `weddings` como a role `anon` (via `rls()`, sem usuária logada) — a
  própria policy de RLS (`weddings_select_vitrine_publica`, Fase 2) já
  garante que só entram os `slug`s de casamentos com `publicado = true`,
  sem precisar de nenhuma query administrativa.
- **Revisão geral (typecheck, N+1, `'use client'`, i18n, RLS)**: feita ao
  final da Fase 9.
  - Typecheck e ESLint zerados no projeto inteiro.
  - RLS: as 17 tabelas de `src/db/schema` têm `.enableRLS()` — nenhuma
    ficou de fora.
  - `'use client'` desnecessário: removido de
    `src/app/(app)/app/orcamento/orcamento-view.tsx` (só compunha
    `Tabs`/`TabsContent`, que já são client components próprios — não
    precisava ser um).
  - Textos em inglês vazados: os componentes `Dialog`/`Sheet` do shadcn
    tinham "Close" fixo (botão de fechar com ícone X, presente por padrão
    em **todo** dialog/sheet do app) — traduzido para "Fechar" em
    `src/components/ui/dialog.tsx` e `sheet.tsx`.
  - Acessibilidade: botões só com ícone (excluir, reordenar por
    drag, "mais ações") ganharam `aria-label` descritivo em vez de
    depender só do ícone — checklist, cronograma, playlist, convidados,
    mesas, orçamento, documentos, lua de mel, fornecedores.
  - N+1: não há leitura em loop (`.map(async`/`for` com `select` por
    item) em nenhuma query; os únicos `for` com uma query por iteração são
    escritas em massa de baixa frequência (reordenar checklist/cronograma/
    playlist por drag, importar convidados por CSV, retry de código único),
    aceitas como troca simples por não afetarem carregamento de página.

## Pós-lançamento (correções após conectar em produção/Vercel)

- **Bugs de infraestrutura só visíveis em produção real**: depois do app no
  ar na Vercel com o Supabase de verdade, apareceram 4 problemas que nenhuma
  ferramenta estática (build/typecheck/lint) pega, porque só se manifestam
  com serviços externos de verdade:
  - `NEXT_PUBLIC_APP_URL` configurada na Vercel como string vazia (em vez de
    ausente) quebrava o build inteiro: `layout.tsx` fazia
    `process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"` para montar
    `new URL(...)` no `metadataBase` — `??` só cai no fallback quando a
    variável é `undefined`/`null`, não quando é `""`, e `new URL("")` estoura
    `Invalid URL`. Trocado por `||` ali e nos outros 4 lugares que liam essa
    mesma variável do mesmo jeito.
  - Os 3 clients Supabase (`browser`/`server`/`middleware`) liam
    `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` com `!`
    (non-null assertion) — faltando a variável na Vercel (nome errado ou
    ambiente errado), o middleware (roda em quase toda rota) derrubava o
    site inteiro com um erro genérico do `@supabase/ssr`. Centralizado em
    `src/lib/supabase/env.ts` (`supabaseEnv()`), que valida as duas de uma
    vez e lança um erro nomeando exatamente o que falta.
  - `DATABASE_URL` de conexão **direta** do Supabase
    (`db.<projeto>.supabase.co`) só resolve por IPv6 — a rede das funções
    da Vercel não tem rota IPv6 de saída, então dava
    `getaddrinfo ENOTFOUND` em toda página autenticada (que passa por
    `rls()`). Resolvido usando o **connection pooler** (Supavisor) do
    Supabase — host `aws-0-<região>.pooler.supabase.com`, compatível com
    IPv4 — só na `DATABASE_URL` da Vercel (localmente a conexão direta
    funciona normalmente, sem precisar trocar). Compatível de graça com o
    `{ prepare: false }` que `src/db/rls.ts` já usava.
  - Moral, na mesma linha do bug de `rls()` documentado acima: infraestrutura
    real (variáveis de ambiente, DNS, protocolo de rede) só se testa
    conectando de verdade — nenhuma dessas quatro falhas aparece rodando só
    localmente ou só com build/typecheck/lint.
- **Mesma classe de bug, 5ª ocorrência: `STRIPE_SECRET_KEY` ausente na Vercel
  derrubava o build inteiro** (Fase 14, só apareceu ao dar deploy — local
  sempre tinha a variável no `.env.local`): `src/lib/stripe.ts` fazia
  `export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)` no
  topo do módulo — o Next importa esse módulo (via
  `src/app/api/stripe/webhook/route.ts`) na etapa de "collect page data"
  do build, então `new Stripe(undefined)` já lançava "Neither apiKey nor
  config.authenticator provided" e derrubava o build **inteiro**, não só a
  rota do webhook. Mesma causa raiz do bug de `supabaseEnv()` acima
  (client construído com `!` no topo do módulo, não dentro de uma função)
  — corrigido do mesmo jeito: `getStripe()`, uma função que só constrói o
  client (e só lança, com mensagem nomeando a variável) quando efetivamente
  chamada em runtime, nunca no import do módulo. Reproduzido localmente
  antes e depois da correção removendo `STRIPE_SECRET_KEY` do
  `.env.local` e rodando `npm run build` — quebrava antes, buildava normal
  depois.
- **Foto de capa com posição e zoom ajustáveis**: `weddings.fotoCapaPosicaoX/Y`
  (percentual 0-100, migration `0004`) guarda o `object-position` da foto de
  capa; `fotoCapaZoom` (percentual 100-300, migration `0005`) guarda um
  `transform: scale()` aplicado por cima, com `transform-origin` no mesmo
  ponto do `object-position` (zoom "em volta" do foco escolhido, não do
  centro). Zoom nunca fica abaixo de 100 — `object-cover` já preenche a
  moldura inteira nesse ponto, ir abaixo deixaria espaço vazio na capa.
  `CoverPhoto` (Configurações) deixa arrastar a prévia (Pointer Events,
  mouse e touch) pra reposicionar e um `Slider` (shadcn) pra dar zoom, ambos
  salvando ao soltar via `atualizarPosicaoFotoCapa`. A página pública
  (`/c/[slug]`) aplica os mesmos três valores na foto de fundo — a seção
  precisou ganhar `overflow-hidden`, senão a imagem com zoom vazava pra fora
  da moldura (o `fill` do `next/image` não corta sozinho quando somado a um
  `transform: scale()`). Enviar uma foto nova reseta os três valores (centro,
  sem zoom) — são relativos à foto anterior, carregá-los pra uma foto
  diferente não faz sentido. Colunas novas em `weddings` entraram também no
  grant de coluna pra `anon` (migrations `0004`/`0005`) e no `columns`
  explícito de `getWeddingPublicaPorSlug` — sem isso a leitura pública
  quebraria com "permission denied" (ver "Grants de coluna para anon" e
  "Queries públicas sempre limitam columns" acima).
- **`CurrencyInput`/`DatePickerField` não repassavam `id`/`aria-*`**: o
  `FormControl` do shadcn injeta essas props via clone (Slot) esperando que
  o componente filho as encaminhe pro elemento interativo real — os dois
  ignoravam qualquer prop além das que já declaravam, então `<label
for=...>` apontava pra um `id` que não existia no DOM em todo formulário
  que os usa. Corrigido aceitando e espalhando `...props`.
- **Item de orçamento sem pagamento ainda não aparecia no select de "novo
  pagamento"**: a lista de opções vinha de um `Map` sobre os próprios
  pagamentos já lançados, não dos itens de orçamento em si — corrigido
  passando a lista completa de itens (achatada a partir de categorias).
- **`truncate` sem `min-w-0` causava overflow horizontal no mobile**: item
  flex tem `min-width: auto` por padrão, então `truncate` (que depende de
  `white-space: nowrap`) não encolhia abaixo do texto inteiro — título de
  tarefa ou nome de convidado compridos empurravam o card pra fora da tela.
  Só `next-tasks-card.tsx` e `table-box.tsx` ficaram sem o `min-w-0` que o
  resto do app já usa nesse padrão.
- **`NEXT_PUBLIC_APP_URL` sem "https://" também derrubava o build**: mesma
  classe do bug de string vazia acima, causa diferente — o valor colado na
  Vercel era `organiza-meu-casamento.vercel.app/` (sem protocolo), e
  `new URL(...)` exige uma URL absoluta. Em vez de só trocar `??` por `||`
  de novo, centralizado em `getUrlBase()` (`src/lib/site.ts`), usado pelos 6
  lugares que liam essa variável: normaliza string vazia (`||`), adiciona
  `https://` quando falta protocolo, e remove `/` sobrando no final (evita
  `//` ao concatenar rota). Reproduzido localmente com
  `NEXT_PUBLIC_APP_URL="organiza-meu-casamento.vercel.app/" npm run build`
  antes e depois da correção.
- **Loading state em botões que disparavam `useTransition` sem capturar o
  `pendente`**: vários (`const [, iniciarTransicao] = useTransition()`)
  descartavam o próprio booleano que indicaria "ação em andamento" — sem
  ele, não tem como desabilitar o botão nem trocar o texto, e a ação
  parecia não ter sido clicada em conexões mais lentas. Corrigido em todo
  botão de exclusão (`AlertDialogAction` e ícones de lixeira — fornecedor,
  cronograma, convidado, item de orçamento, mesa, equipe, presente, música,
  inspiração, enxoval, lua de mel), nos botões "abrir documento" (busca
  signed URL antes de abrir a aba) e em "Sair". De brinde, dois checkboxes
  (`gifts-grid.tsx`, `packing-checklist.tsx`) estavam sem estado local
  otimista — o `checked` vinha direto da prop do servidor, então o clique
  só refletia visualmente depois da revalidação completa; agora seguem o
  mesmo padrão já usado em `task-row.tsx`/`payments-tab.tsx` (estado local
  atualizado na hora, revertido só se a Server Action retornar erro).
- **Foto de capa: edição atrás de um botão "Editar posição"**: antes a área
  de arrastar/zoom ficava sempre visível; agora só aparece depois de clicar
  em "Editar posição" (some de novo em "Concluir edição"), e abre sozinha
  ao enviar uma foto nova — menos poluição visual quando não se está
  ajustando o enquadramento.
- **Item ativo mais destacado na bottom nav (mobile)**: `text-primary` vs
  `text-muted-foreground` sozinho era sutil demais pra notar em qual aba se
  está (as duas cores são tons médios parecidos em luminosidade). Adicionado
  um fundo `bg-accent` em pílula atrás do ícone ativo, igual ao tratamento
  que os itens do drawer "Mais" já tinham.
- **Link da página pública em Configurações**: o campo de endereço mostrava
  um domínio de exemplo fixo ("meucasamento.com") em vez do domínio real do
  deploy. Trocado para usar `NEXT_PUBLIC_APP_URL` (a mesma variável já usada
  em `robots.ts`/`sitemap.ts`/convites) e exibir o link completo e clicável
  da página pública, com botão de copiar.
- **Tema escuro**: pedido explícito da dona. As variáveis `.dark` já
  existiam em `src/app/globals.css` desde o init do shadcn (Fase 1) mas
  nunca eram aplicadas — o trabalho foi todo em como ativar/persistir a
  classe, não em paleta nova.
  - **3 opções (Claro/Escuro/Sistema), não só um botão liga/desliga**:
    `src/lib/theme.ts` (`Tema`) + `ThemeProvider`
    (`src/components/theme-provider.tsx`, contexto React simples) +
    `ThemeToggle` (`src/components/theme-toggle.tsx`, dropdown com
    ícone sol/lua) — "Sistema" acompanha `prefers-color-scheme` do SO ao
    vivo via `matchMedia(...).addEventListener("change", ...)`, sem precisar
    recarregar a página.
  - **`localStorage`, não banco**: única exceção deliberada à regra "sem
    localStorage pra dado de negócio" (ver Convenções) — tema é preferência
    de UI do navegador, não dado do casamento; salvar no banco faria a
    dona ver o tema errado ao trocar de dispositivo por 1 request até a
    hidratação, sem ganho real (ninguém espera que o tema "siga a conta"
    entre computador e celular).
  - **Script inline no `<head>` do layout raiz** (`SCRIPT_TEMA_INICIAL`,
    `src/lib/theme.ts`) aplica a classe `dark` no `<html>` lendo o
    `localStorage` antes do primeiro paint — sem isso a página nasce clara
    e pisca pro tema salvo um instante depois (flash of wrong theme), já
    que o React só teria a chance de aplicar a classe depois de hidratar.
    Como esse script mexe na classe do `<html>` por fora do React,
    `suppressHydrationWarning` no `<html>` evita o aviso de mismatch.
  - **Toggle só no header da área logada** (`AppHeader`, ao lado do menu de
    conta): "no app todo" aqui é a área logada (a pasta já se chama
    `(app)/app`) — a página pública do casal (`/c/[slug]`) e o marketing
    mantêm a paleta clara fixa de propósito (ver decisão de Paleta acima),
    sem toggle.
- **Convite de equipe sem e-mail de verdade nunca expunha o link pra dona
  enviar**: `convidarMembro` (Equipe) sempre gerou um `conviteToken`
  (`/convite/[token]`), mas o retorno da Server Action descartava o token e
  o diálogo só fechava com "Convidado com sucesso" — não existe envio de
  e-mail automático (diferente do que "convidar por e-mail" sugere), então
  a pessoa convidada nunca recebia nada e não tinha como saber que existia
  um convite esperando por ela ou "logar" em algo. Corrigido em duas
  frentes: (1) `convidarMembro` agora devolve o `conviteToken`, e o
  diálogo, ao criar o convite, mostra o link `/convite/[token]` pronto pra
  copiar (mesma ideia do link de RSVP dos convidados, Fase 6) em vez de só
  fechar; (2) cada linha "Convite pendente" em `/app/equipe` ganhou um
  botão "Copiar link" próprio, pra recuperar o link depois caso a dona
  feche o diálogo sem copiar. O fluxo em si (a pessoa abre o link, cria
  conta com o e-mail que quiser — não precisa bater com o e-mail digitado
  no convite, o token secreto é que autoriza — e `aceitarConvite` já
  vincula o `user_id`) já funcionava desde a Fase 3; faltava só a dona
  conseguir entregar o link.

- [x] **Fase 1 — Fundação**: Next 15 + TS strict + Tailwind v4 + shadcn/ui,
      clientes Supabase (browser/server/middleware), Drizzle configurado,
      Prettier, `.env.example`, README, estrutura de pastas, paleta e
      tipografia editorial nos tokens globais.
- [x] **Fase 2 — Modelo de dados**: schema Drizzle completo (18 tabelas + 12
      enums), migrations (`0000` estrutura, `0001` funções/RLS/triggers/
      storage), RLS habilitada em todas as tabelas, seed com casamento de
      exemplo completo.
- [x] **Fase 3 — Auth e onboarding**: entrar/cadastro/recuperação de senha
      (e-mail+senha e Google), callback OAuth/PKCE, wizard de 5 telas em
      `/inicio` com rascunho salvo no banco a cada passo, geração automática
      de categorias de orçamento e checklist de 68 tarefas ao concluir.
- [x] **Fase 4 — Layout e dashboard**: sidebar (desktop) e bottom nav com
      drawer (mobile), header com contagem regressiva compacta, dashboard
      com 6 cards clicáveis, `Suspense` + skeleton e empty states.
- [x] **Fase 5 — Checklist, orçamento e fornecedores**.
- [x] **Fase 6 — Convidados, mesas e RSVP**.
- [x] **Fase 7 — Módulos restantes** (cronograma, inspirações, playlist,
      presentes, enxoval, lua de mel, documentos, equipe, configurações,
      exportar).
- [x] **Fase 8 — Página pública do casal** (`/c/[slug]`).
- [x] **Fase 9 — Marketing e finalização**.
- [x] **Fase 10 — Construtor de blocos da página pública** (`/app/site-publico`).
- [x] **Fase 11 — Fotos enviadas pelos convidados via QR code**
      (`/app/fotos-convidados`, `/c/[slug]/fotos`).
- [x] **Fase 12 — Conta cerimonialista (multi-casamento)** (`/casamentos`).
- [x] **Fase 13 — Planos e preços** (noiva: pagamento único; cerimonialista:
      Básico/Premium/Platinum mensais).
- [x] **Fase 14 — Pagamentos via Stripe** (checkout, webhook, `/pagamento`,
      `/planos`) — modo teste, sem CNPJ validado ainda.
- [x] **Fase 15 — Rebranding da landing page** (`/`) — visual mais expressivo
      pra converter visita em cadastro.
- [x] **Fase 16 — Nome definitivo**: "Meu Casamento" → "Organiza meu
      Casamento".
- [x] **Fase 17 — 2º rebranding da landing page**: seção "Como funciona",
      grid de funcionalidades em bento, mais textura visual no hero.
- [x] **Fase 18 — Rebranding do dashboard**: anel de progresso nos cards,
      card de fornecedores novo, contagem regressiva com data/local.

## Fase 10 — Construtor de blocos da página pública

Pedido explícito da dona: montar a página pública com liberdade — arrastar
pra reordenar, ocultar o que não quiser, e incluir foto/galeria/texto onde
fizer sentido. Decisão de escopo tomada com o usuário antes de implementar
(pergunta feita porque muda a arquitetura, não é só "opção mais simples"):
RSVP, presentes e local **continuam páginas próprias e funcionais** —
`/c/[slug]/confirmar`, `/c/[slug]/presentes`, `/c/[slug]/local` (formulário,
reserva de presente, RLS por token/código) não viram blocos de conteúdo
solto; o que virou bloco arrastável é o **cartão de entrada** pra cada uma
dessas páginas na home (antes uma grade fixa de 3, sempre nessa ordem,
sempre visível — agora cada uma reordenável/ocultável individualmente),
mais "Nossa história" (que já existia como seção fixa) e 3 tipos de
conteúdo livre novos: foto, galeria de fotos e texto.

- **Modelo de dados**: uma tabela nova, `page_blocks` (`tipo`, `ordem`,
  `visivel`, `config` jsonb) — não um array JSONB dentro de `weddings`,
  porque cada linha precisa de RLS própria (igual weddings, sem virar uma
  segunda `is_wedding_member` por wedding). `config` é `null` pras 4 seções
  embutidas (historia/nav_rsvp/nav_presentes/nav_local — usam dado que já
  existe em `weddings`/rotas fixas) e só carrega algo pros 3 blocos de
  conteúdo livre. Sem PII na tabela, então — diferente de
  weddings/guests/gifts — não precisou do revoke+grant por coluna pra
  `anon`, só uma policy de linha normal (`visivel = true` e
  `weddings.publicado = true`), seguindo o mesmo padrão de
  `gifts_publico_select`.
- **Sem migration de backfill**: as 4 seções fixas nascem na primeira
  visita da dona a `/app/site-publico` (`garantirBlocosPadrao`, idempotente
  — só insere se a tabela estiver vazia pro casamento). A página pública
  (`getBlocosPublicos`) cai de volta pro layout fixo antigo quando não há
  bloco nenhum — importante porque casamentos já publicados antes dessa
  fase (inclusive o de produção) continuam exatamente iguais até a dona
  abrir o construtor pela primeira vez.
- **Bucket de Storage novo, `blocos`** (migration `0006`): público, mesmo
  padrão de `capas`/`presentes` (path `{wedding_id}/arquivo.ext`,
  `can_edit_wedding` pra escrita).
- **Foto de bloco reaproveita a UI de arrastar/zoom da foto de capa**
  (Fase 9): mesma técnica de `object-position` + `transform: scale()` com
  `transform-origin` no mesmo ponto, mas como componente separado
  (`foto-block-dialog.tsx`) em vez de generalizar `CoverPhoto` — evita
  arriscar regressão num componente já testado em produção por uma
  generalização prematura.
- **Reordenar usa o mesmo padrão de `reordenarMusicas`/cronograma**:
  dnd-kit `SortableContext` + atualização otimista local + Server Action
  que regrava `ordem` de todos os ids num loop (aceito como troca simples
  de N+1, mesma decisão já registrada acima pra checklist/cronograma/
  playlist).
- **Dialogs de bloco recebem `open`/`onOpenChange` controlados** (não o
  padrão `trigger: ReactNode` usado em outros dialogs do app, como
  `SongFormDialog`/`GuestFormDialog`) — motivo é o bug documentado logo
  abaixo: precisavam poder abrir sem estar aninhados dentro do
  `DropdownMenu` "Adicionar bloco". O mesmo componente ainda serve pra
  criar e editar, diferenciado por receber ou não um `bloco` existente; a
  edição (chamada a partir da própria linha do bloco, fora de qualquer
  menu) controla o `open` com um `useState` local na própria linha.
- **Verificado com RLS de verdade antes de considerar pronto**: script à
  parte (fora do app, com rollback de transação) confirmou insert+select
  como `authenticated` e select como `anon` na tabela nova, contra o banco
  de produção — mesmo tipo de checagem que pegou o bug real de `rls()` na
  Fase 2.
- **Bug real pós-lançamento: "Adicionar bloco" > Foto/Galeria não criava
  nada, sem erro nenhum (nem na tela, nem no console)** — só apareceu
  depois que a dona usou o construtor de verdade em produção (achado
  investigando o relato dela, não em teste automatizado). Causa: os 3
  diálogos de bloco (foto/galeria/texto) nasciam com o padrão
  `trigger: ReactNode` de sempre, e o item do `DropdownMenuContent` que os
  abre precisava de `onSelect={(e) => e.preventDefault()}` pra impedir o
  menu de fechar sozinho — só que isso deixa o `<Dialog>` inteiro (não só o
  gatilho) **montado dentro da árvore do `DropdownMenuContent`**. Pra
  "Foto" e "Galeria", o botão "Escolher foto" abre o seletor nativo de
  arquivo do sistema operacional — uma janela de verdade, fora do
  navegador. Quando essa janela fecha (arquivo escolhido) e o foco volta
  pro navegador, o `DismissableLayer` do Radix por trás do `DropdownMenu`
  (ainda "aberto", já que o fechamento automático tinha sido bloqueado)
  interpreta a troca de foco como um clique/foco "de fora" e fecha o menu
  de verdade — desmontando junto todo o `FotoBlockDialog`/`GaleriaBlockDialog`
  (e o estado local: preview, posição, zoom, fotos escolhidas) antes que
  "Salvar" fosse sequer possível clicar. "Texto" nunca esbarrava nisso
  porque não abre nenhuma janela nativa do SO — só um `<textarea>` comum —
  e por isso não foi notado antes. Confirmado isolando as duas metades:
  (1) um script à parte (rollback forçado, produção) provou que o INSERT
  em `page_blocks` com `tipo = 'foto'` passa na RLS sem problema nenhum
  pela policy `page_blocks_insert`; (2) uma consulta em
  `storage.objects` mostrou **zero arquivos** já enviados pro bucket
  `blocos` nessa conta, apesar da dona ter tentado múltiplas vezes — ou
  seja, o upload nunca chegava a acontecer synchronously, batendo com a
  teoria de desmontagem prematura em vez de erro de permissão. Corrigido
  tirando os 3 diálogos de dentro do `DropdownMenuContent`: agora
  `SitePublicoView` guarda `novoBloco: "foto" | "galeria" | "texto" | null`
  num `useState`, os itens do menu só fazem `onSelect={() =>
setNovoBloco("foto")}` (sem precisar de `preventDefault`, o menu fecha
  normal) e os 3 diálogos ficam sempre montados como irmãos do
  `DropdownMenu` (fora dele), abrindo/fechando via prop `open` — nunca mais
  dependem do ciclo de vida do menu. Como ficam sempre montados, o estado
  interno de cada um (preview da foto, lista de fotos da galeria) passou a
  reinicializar via `useEffect` toda vez que `open` vira `true`, em vez de
  confiar em desmontar/remontar entre uma adição e outra.
- **2º bug real, na sequência do de cima: depois de corrigir o desmonte
  prematuro, o upload em si passou a dar `400 Bad Request` — mas só com
  certos nomes de arquivo**, ex. um screenshot do macOS chamado "Captura de
  Tela 2026-07-17 às 15.49.30.png". Causa: `caminho = "${weddingId}/${crypto.randomUUID()}-${arquivo.name}"`
  embutia o nome original do arquivo no path do Storage — e o macOS entrega
  `File.name`, quando lido do sistema de arquivos, em Unicode **decomposto**
  (NFD: "a" + acento grave combinante, em vez do caractere composto "à"
  único). A API de Storage do Supabase valida a "key" do objeto e rejeita
  esse formato com `400 InvalidKey` (confirmado reproduzindo isolado com a
  service role key contra o bucket `blocos` de produção: o mesmo path com o
  nome original dá `400`, o path só com uuid+extensão dá sucesso — teste
  limpo depois, sem deixar arquivo órfão). Esse mesmo padrão
  `${uuid}-${arquivo.name}` estava copiado em **8 lugares** (todo upload
  direto do navegador pro Storage: capa, presentes, inspirações,
  documentos, contrato de fornecedor, fotos de convidados via QR code, e os
  2 daqui) — qualquer nome de arquivo com acento decomposto, ou outro
  caractere fora do que a API aceita, quebraria a mesma forma em qualquer
  um deles, não só no construtor de blocos. Corrigido criando
  `caminhoArquivoStorage(weddingId, arquivo)` (`src/lib/storage-path.ts`),
  usado agora nos 8 lugares: o path vira só `{wedding_id}/{uuid}.{extensão
  sanitizada}`, nunca o nome original. Onde o nome de exibição importa pra
  usuária ver depois (ex. `documents.nome`), ele já era guardado numa
  coluna à parte, independente do path do Storage — então nada deixou de
  funcionar, só o path parou de carregar um nome de arquivo arbitrário.

## Fase 11 — Fotos enviadas pelos convidados (QR code)

Pedido explícito: os noivos querem um QR code pra mostrar na festa —
convidado escaneia, envia as fotos que tirou, sem precisar de login ou
conta, e o casal vê/baixa tudo depois em `/app/fotos-convidados`. Diferente
do bloco "galeria" da Fase 10 (fotos que o casal escolhe e cura pra exibir
publicamente), aqui é o inverso: convidado envia, só a equipe vê — não é
uma galeria compartilhada entre convidados.

- **Tabela `guest_photos`** (`caminho`, `nome_convidado` opcional,
  `created_at`) + policy de insert pública pra `anon` (mesmo formato
  `exists (... w.publicado = true)` de `gifts_publico_reservar`/
  `page_blocks_publico_select`) — **sem** policy de select pra `anon`, de
  propósito: convidado só escreve, nunca lê a tabela (ninguém vê foto de
  outro convidado, só a equipe).
- **Bug real encontrado só testando a policy de INSERT contra o Postgres
  de verdade** (mesma categoria dos bugs de protocolo/rede já documentados
  acima — só aparecem com banco de verdade, não em build/typecheck/lint):
  o script de verificação usava `insert ... returning id` pra conferir o
  que foi gravado, e isso falhava com "new row violates row-level security
  policy" **mesmo o `with check` da policy de insert avaliando `true`**
  isoladamente. Causa: `INSERT ... RETURNING` no Postgres também exige que
  a linha satisfaça alguma policy de **SELECT** pro role atual — não só o
  `WITH CHECK` do INSERT — porque devolver a linha de volta equivale, pra
  fins de RLS, a fazer um SELECT nela. Como `guest_photos` não tem policy
  de SELECT pra `anon` (de propósito, ver acima), qualquer `.returning()`
  nessa tabela quebra pra esse role. A ação real
  (`enviarFotosConvidado`) nunca usou `.returning()`, então não é afetada
  — mas fica registrado aqui porque é uma pegadinha genérica do Postgres:
  **uma tabela com INSERT liberado pra um role mas sem SELECT nunca pode
  usar `.returning()` nesse insert**, mesmo que o `WITH CHECK` passe.
- **Bucket de Storage novo, `fotos-convidados`**: privado (diferente de
  `capas`/`presentes`/`blocos`) — só a equipe visualiza via signed URL
  (`obterUrlsAssinadas`, já genérico desde a Fase 7), convidado só tem
  policy de `insert` no `storage.objects`, nunca `select`.
- **QR code gerado no servidor** (`qrcode`, `QRCode.toDataURL`) em vez de
  um serviço externo de QR-code-como-API: não depende de terceiro no ar,
  não vaza o link do casamento pra fora, e não precisa de chave — mesma
  lógica da decisão do mapa embutido sem API key. Vira `data:` URL
  embutida direto num `<Image>`, sem rota própria.
- **Baixar/imprimir o QR code sem lib nova**: `data:` URL já é
  "salvar imagem como" nativo do navegador; impressão reaproveita
  `ExportPdfButton`/`window.print()` (Fase 7) com `print:hidden` nos
  botões — mesmo padrão do mapa de mesas.
- **Sem moderação/aprovação nessa primeira versão**: toda foto enviada
  aparece direto pra equipe; exclusão é manual (mesmo padrão de
  `excluirDocumento`/`excluirInspiracao` — remove só a linha do banco, o
  arquivo no Storage fica órfão, aceito como troca simples).

## Fase 12 — Conta cerimonialista (multi-casamento)

Pedido explícito da dona, com intenção de monetização: cerimonialista
paga uma conta profissional própria e cadastra/administra o casamento de
vários clientes diferentes — hoje (Fases 1–11) toda conta só tinha um
casamento (`getMinhaWedding()` fazia `findFirst`, e as Server Actions do
onboarding atualizavam `where(ownerId = auth.uid())`, que já pressupunha
"no máximo 1"). Decisão de escopo tomada com o usuário antes de
implementar (3 perguntas — muda modelo de dados, cadastro e toca em
cobrança):

- **Cobrança real fica pra depois**: nesta fase não existe Stripe nem
  nenhum gate de pagamento — conta cerimonialista tem acesso completo e
  ilimitado a criar casamentos, exatamente como hoje o preço da landing é
  placeholder (ver decisão "Preço é placeholder"). Cobrança mensal de
  verdade é trabalho futuro, quando houver conta Stripe configurada.
- **Ela mesma cadastra cada casamento** (em vez de só ser convidada
  casamento por casamento via `wedding_members`, como cerimonialista já
  podia ser desde a Fase 2): ela vira `owner_id` do casamento que cria,
  com controle total — modelo de ferramenta de trabalho profissional, não
  de convidada. `wedding_members` com `papel = 'cerimonialista'` continua
  existindo do jeito que já era (uma noiva convidando **a própria**
  cerimonialista pro casamento dela) — são dois caminhos independentes
  pro mesmo tipo de pessoa, não uma substituição.
- **Tipo de conta escolhido no cadastro** (`/cadastro`, só no formulário
  de e-mail/senha — o botão do Google não pergunta nada no meio do fluxo
  OAuth, então cadastro via Google sempre nasce `tipoConta = 'noiva'`;
  quem quer conta cerimonialista com login Google não está coberto nesta
  fase, teria que recriar a conta com e-mail/senha).

### Modelo de dados

- **`profiles.tipoConta`** (`pgEnum` novo, `tipo_conta`: `noiva` |
  `cerimonialista`, default `'noiva'`) — só essa coluna nova. `weddings`
  não mudou nada: `ownerId` nunca teve unicidade, uma conta já podia
  "tecnicamente" possuir vários casamentos a nível de banco — só a
  UI/actions da app é que assumiam 1:1. `handle_new_user()` (trigger da
  Fase 2) foi atualizado pra gravar `tipo_conta` a partir de
  `raw_user_meta_data ->> 'tipo_conta'` (metadata do Supabase Auth
  setada no cadastro), com `coalesce` pro padrão `'noiva'` — cobre tanto
  cadastro via Google (sem essa metadata) quanto as contas que já
  existiam antes desta coluna.
- **Cookie `casamento_ativo`** (`src/lib/casamento-ativo.ts`), não coluna
  no banco: guarda qual casamento é "o atual" da sessão. `getMinhaWedding()`
  (`src/db/queries/weddings.ts`) resolve por esse cookie primeiro, com
  fallback pro casamento mais antigo visível à conta — o fallback sozinho
  já resolve certo pra conta noiva (1 casamento só) mesmo sem cookie
  nenhum, então nada mudou pra quem já usava o produto. RLS garante que um
  cookie adulterado (id de casamento de outra conta, ou já excluído) só
  cai no fallback em vez de vazar dado — a query do `getMinhaWedding`
  filtra pela mesma policy de sempre, o cookie não é "confiado" por si só.
- **Bug de correção de dados que só apareceria com 2+ casamentos por
  conta** (achado revisando o código antes de escrever a feature nova, não
  em produção): as Server Actions do onboarding (`src/actions/onboarding.ts`)
  faziam `update(weddings).set(...).where(eq(weddings.ownerId, user.id))`
  — sem `LIMIT`, isso atualiza **todas** as linhas daquele dono de uma vez.
  Inofensivo enquanto só existia 1 casamento por conta, mas quebraria
  silenciosamente qualquer conta cerimonialista com 2+ casamentos (editar o
  rascunho de um cliente reescreveria data/orçamento de todos os outros
  casamentos dela ao mesmo tempo). Corrigido resolvendo o casamento alvo
  via `getMinhaWedding()` (cookie ativo) e filtrando por
  `eq(weddings.id, wedding.id)` em todas as etapas do wizard.
- **Nova pegadinha de Postgres RLS, prima da já documentada na Fase 11**:
  `criarCasamento` originalmente usava `.insert(weddings).values(...).returning({id: ...})`
  pra saber o id do casamento recém-criado — e isso falhava com "new row
  violates row-level security policy" mesmo o `WITH CHECK` do insert
  passando, **mesmo existindo** policy de SELECT pra `authenticated`
  (diferente do caso de `guest_photos`, que não tinha policy de SELECT
  nenhuma). Causa, confirmada isolando o teste contra produção: a policy
  de SELECT de `weddings` roda via `is_wedding_member()` — uma função
  `security definer` que faz sua **própria** consulta em `public.weddings`
  pra decidir se o role atual é dono/membro. Essa consulta interna é um
  comando separado dentro da mesma transação e não enxerga a linha que o
  `INSERT` ainda está inserindo (visibilidade por command counter do
  Postgres: uma subconsulta não vê as linhas que o comando "pai" ainda não
  terminou de gravar) — então o check implícito de SELECT que o
  `RETURNING` exige falha sempre, incondicionalmente, pra qualquer insert
  em `weddings` que use `.returning()`. Um `select` manual **depois** do
  insert (comando separado) enxerga a linha normalmente — só o
  `RETURNING` no mesmo comando do `INSERT` que não funciona aqui. Moral
  mais ampla que a da Fase 11: **`.returning()` também pode falhar numa
  tabela que TEM policy de SELECT, se essa policy passar por uma função
  seguridade-definidora que reconsulta a própria tabela** — não é exclusivo
  de tabela sem SELECT nenhuma. Corrigido gerando o `id` em JS
  (`crypto.randomUUID()`) e passando explícito no insert, em vez de deixar
  o banco gerar (`defaultRandom()`) e tentar recuperá-lo via `.returning()`.
- **Verificado com RLS de verdade antes de considerar pronto**, mesmo
  método das Fases 10/11 (script à parte, `sql.begin()` com rollback
  forçado, contra o banco de produção): trigger grava `tipo_conta`
  corretamente a partir da metadata; a mesma conta cria 2 casamentos;
  `select where owner_id = ...` (usado por `getMeusCasamentos`) vê os 2;
  `update where id = ...` muda só o casamento certo e não vaza pro outro
  dono da mesma conta (a correção do bug acima); exclusão por id remove só
  1. Foi nesse script que o bug do `.returning()` acima apareceu e foi
  isolado.

### Rotas e navegação

- **`/casamentos`** (fora de `(app)/app`, mesmo padrão de `/inicio` —
  acessível sem casamento cadastrado): painel só pra conta cerimonialista
  (`CasamentosLayout` redireciona pra `/app` ou `/inicio` se a conta for
  `noiva`) — lista os casamentos que ela é dona, cada um com "Entrar"/
  "Continuar cadastro" (seta o cookie `casamento_ativo` e entra) e
  "Excluir". "Novo casamento" pede só os 2 nomes (`nomesSchema`,
  reaproveitado do onboarding) e cai direto em `/inicio/data` — pula o
  passo de nomes do wizard porque acabou de preencher ali mesmo.
- **`(app)/app/layout.tsx`**: sem casamento ativo concluído, conta noiva
  cai em `/inicio` (como sempre) e conta cerimonialista cai em
  `/casamentos` — não faz sentido jogar uma conta que gerencia vários
  casamentos num wizard pensado pra "o meu casamento".
- **"Trocar casamento"** no menu de conta (`UserMenu`, ícone no header),
  só visível pra conta cerimonialista — link direto pra `/casamentos`.
- **Middleware**: `/casamentos` entrou na lista de rotas que exigem login
  (redireciona deslogado pra `/entrar`), igual `/app` e `/inicio`.
- **`onboardingConcluido()` movida** de `src/db/queries/weddings.ts` pra
  `src/lib/wedding-status.ts` (função pura, sem import de servidor):
  `casamento-card.tsx` (Client Component, mostra o badge "cadastro
  completo/incompleto" de cada card) precisava dela, e `weddings.ts`
  agora importa `next/headers` (pelo cookie do casamento ativo) — Next
  recusa buildar um Client Component que importa (mesmo que indiretamente)
  um módulo com `next/headers`.

## Fase 13 — Planos e preços

Pedido explícito: definir os planos de venda agora que existem 2 tipos de
conta. Modelo pedido pela dona (valores e funcionalidades de cada plano
ficaram a critério da implementação): **noiva** é plano único, pagamento
único, sem mensalidade; **cerimonialista** tem 3 planos mensais (Básico,
Premium, Platinum), preço e limite diferentes cada um.

- **Preço ainda é placeholder** — mesma ressalva já registrada pra
  `PricingSection` desde a Fase 9 (`Preço é placeholder`), agora estendida
  aos 3 planos novos: nenhum desses valores foi validado com o mercado,
  são só números plausíveis pra ter algo publicável. Trocar antes do
  lançamento de verdade.
- **O diferencial real entre os planos da cerimonialista é só 1: quantos
  casamentos simultâneos ela pode cadastrar** (Básico 5, Premium 15,
  Platinum ilimitado) — é a única coisa que dá pra aplicar de verdade no
  código hoje, porque todo casamento cadastrado (não importa o plano de
  quem cadastrou) usa o app inteiro sem nenhum flag de feature por módulo
  (checklist, convidados, site público etc. não têm "nível" — todo
  casamento tem tudo). Os outros itens listados em cada plano (nível de
  suporte) são promessa comercial/operacional, não uma trava de código —
  evitei prometer feature que não existe de verdade.
- **`profiles.planoCerimonialista`** (`pgEnum` novo, `plano_cerimonialista`:
  `basico` | `premium` | `platinum`, nullable — null pra conta noiva, não
  se aplica). `handle_new_user()` (trigger da Fase 2, já mexida nas Fases
  12) grava `'basico'` automaticamente pra toda conta que nasce
  `tipo_conta = 'cerimonialista'`. **Sem Stripe ainda** (decisão já tomada
  na Fase 12): não existe checkout nem cobrança de verdade — trocar de
  plano é uma atualização manual dessa coluna (por você, direto no banco
  ou via `db:studio`) até existir integração de pagamento reAL.
- **Limite aplicado de verdade em `criarCasamento`** (`src/actions/casamentos.ts`):
  antes de inserir, compara `getMeusCasamentos().length` contra
  `LIMITE_CASAMENTOS_POR_PLANO[plano]` (`src/lib/planos.ts` — fonte única
  de preço/limite, importada tanto pela Server Action quanto pela página
  de preços, pra nunca desalinhar o que é vendido do que é aplicado).
  Limite atingido devolve erro pedindo pra falar com a equipe pra
  upgrade — não existe fluxo de autoatendimento pra trocar de plano ainda
  (não faz sentido sem cobrança real por trás).
- **`/casamentos` mostra o plano atual e quantos casamentos já foram
  usados** (ex.: "3 de 5 casamentos usados") com link pra `/precos` — pra
  a cerimonialista nunca ser surpreendida pelo limite sem contexto antes
  de tentar cadastrar o próximo.
- **`PricingSection`** (usada na home e em `/precos`) ganhou 2 blocos:
  "Para noivas" (1 card, preço único) e "Para cerimonialistas" (grid de 3
  cards, preço mensal + limite de casamentos em destaque + itens). FAQ e
  `/para-cerimonialistas` atualizados pra descrever os dois caminhos
  possíveis pra uma cerimonialista (ser convidada por uma noiva **ou**
  criar a própria conta profissional) — não é mais só o primeiro.
- **Verificado com RLS de verdade antes de considerar pronto**, mesmo
  método das Fases 10–12 (script com rollback forçado contra produção):
  trigger grava `plano_cerimonialista = 'basico'` pra conta cerimonialista
  nova e `null` pra conta noiva; 5 casamentos (limite do Básico) são
  criados e contados corretamente via RLS.

## Fase 14 — Pagamentos via Stripe

Pedido explícito: integrar o Stripe de verdade (checkout + webhook) pros 2
modelos de cobrança definidos na Fase 13. **Modo teste** (chaves
`sk_test_`/`pk_test_`) — o CNPJ da dona ainda está em processo; trocar pras
chaves de produção quando existir conta Stripe validada, sem mudar nenhuma
linha de código (só as env vars).

- **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` guardada mas não usada ainda**: o
  checkout é 100% hosted (Server Action cria a Session e redireciona pra
  URL do Stripe) — não tem Stripe.js/Elements embutido no front, que é o
  único caso que precisaria da chave pública. Guardada no `.env` pra
  quando/se algum dia trocar pra checkout embutido.
- **Produtos/preços criados uma vez via script** (`scripts/stripe-setup.ts`,
  `npm run stripe:setup`), não no Dashboard manualmente — usa
  `src/lib/planos.ts` como fonte dos valores (mesma fonte da página de
  preços e do limite aplicado no app, nunca 3 lugares divergentes) e
  `lookup_key` pra ser idempotente (rodar de novo não duplica produto).
- **Gate de pagamento decidido com o usuário antes de implementar** (3
  perguntas — muda semântica de acesso pra quem já usa o app):
  contas que já existiam (inclusive o casamento de produção da dona) foram
  **grandfatheadas como pagas** — `weddings.pago` nasceu com `default true`
  na migration (backfill de quem já existia) e só depois o default virou
  `false` pra casamento novo dali pra frente. Noiva paga **depois** do
  wizard de onboarding inteiro, só ao tentar entrar em `/app` — ela já viu
  o valor do produto preenchido antes de decidir pagar. Cerimonialista com
  assinatura cancelada só perde a capacidade de cadastrar casamento novo —
  os que já tinha continuam intactos e acessíveis.
- **`weddings.pago`** (boolean): gate do pagamento único da noiva, checado
  em `(app)/app/layout.tsx` — só se aplica a casamento de conta noiva;
  casamento criado por conta cerimonialista já nasce com `pago: true`
  (coberto pela assinatura dela, não por uma cobrança avulsa por
  casamento).
- **Cerimonialista deixou de ganhar plano "basico" de graça no cadastro**:
  a Fase 12/13 auto-atribuía `basico` a toda conta cerimonialista nova
  (`handle_new_user`); agora que existe cobrança de verdade, ela nasce
  **sem plano** (`plano_cerimonialista = null`) e só ganha um quando o
  webhook confirmar a primeira assinatura. `criarCasamento` trata
  `null` como bloqueio total (nunca assinou ou cancelou) — diferente de
  `limiteAtingido(null, ...)`, que por si só devolveria "sem limite"; quem
  decide o que "sem plano" significa é o chamador. Contas cerimonialista
  que já tinham `basico` de graça de antes desta fase **não foram
  mexidas** (mesmo espírito de grandfathering do `weddings.pago` acima).
- **Correlação webhook → conta/casamento é só por `metadata`, sem tabela de
  mapeamento**: checkout de pagamento único carrega
  `metadata: { tipo: "noiva", weddingId }` direto na Session; checkout de
  assinatura grava o metadata em `subscription_data.metadata` (não só na
  Session) — isso persiste no objeto `subscription` em si, então **todo
  evento futuro** sobre aquela assinatura (renovação, cancelamento) já
  chega com `userId`/`plano` de graça, sem precisar consultar nada. A
  única coisa que precisou de bookkeeping próprio foi
  `profiles.stripeCustomerId` (pro botão "Gerenciar assinatura" —
  `stripe.billingPortal.sessions.create` exige um customer id).
- **`profiles.stripeCustomerId` é a única escrita de Server Action que usa
  o client administrativo (`db`, normalmente restrito a migrations/seed —
  ver "Acesso a dados" no topo deste arquivo)**: essa coluna teve UPDATE
  revogado da role `authenticated` (ver hardening abaixo), então nem o
  próprio código do app consegue mais gravá-la via `rls()`. É bookkeeping
  de sistema, não dado de negócio do casamento, e a linha afetada é sempre
  a da própria usuária autenticada (`user.id` vem da sessão verificada do
  Supabase, nunca de input do cliente) — documentado com o mesmo cuidado
  em `src/db/index.ts`. O webhook (`src/app/api/stripe/webhook/route.ts`)
  é a segunda exceção: não tem sessão de usuária pra passar por `rls()`
  (é o Stripe chamando o servidor, não uma pessoa logada), autenticidade
  vem só da assinatura HMAC (`stripe.webhooks.constructEvent`) verificada
  antes de qualquer escrita.
- **Bug de segurança real encontrado só testando contra o Postgres de
  verdade** (mesma categoria dos outros já documentados neste arquivo — só
  aparece com banco real, nunca em build/typecheck/lint): a primeira
  tentativa de bloquear `weddings.pago`/`profiles.planoCerimonialista` de
  edição pela própria usuária foi
  `revoke update (coluna) on tabela from authenticated` — e isso **não
  teve efeito nenhum**. Causa: `authenticated` já tinha UPDATE concedido a
  nível de **tabela inteira** (grant padrão do Supabase); no modelo de ACL
  do Postgres, revogar uma coluna específica só desfaz algo que tivesse
  sido concedido naquele mesmo nível de coluna — não recorta uma exceção
  de dentro de um grant mais amplo já existente. Confirmado com uma
  consulta direta a `information_schema.column_privileges` depois de
  aplicar a migration: as 4 colunas sensíveis continuavam com UPDATE
  liberado pra `authenticated`, ou seja, **qualquer conta autenticada
  podia chamar a REST API do Supabase diretamente (por fora deste app,
  sem passar por nenhuma Server Action) e se autoconceder pagamento ou
  plano de graça**. Corrigido numa migration de fix (mesmo padrão já usado
  pra `anon` desde a Fase 2): `revoke update on tabela from authenticated`
  (tabela inteira, só o UPDATE) seguido de `grant update (lista exata de
  colunas editáveis) on tabela to authenticated`. De brinde, `owner_id` de
  `weddings` ficou de fora da lista de colunas liberadas — fecha uma
  brecha que já existia antes desta fase (um membro "admin" via
  `wedding_members`, sem ser a dona, podia em tese tentar se autoconceder
  a propriedade do casamento com um update direto).
- **Verificado com RLS de verdade contra produção, em 2 camadas** (script
  com rollback forçado, uma transação isolada por cenário — descoberto que
  reaproveitar a mesma transação depois de um erro esperado engana o
  teste; melhor
  isolar cada asserção): (1) `authenticated` continua editando colunas
  normais (`weddings.nomeNoiva`, `profiles.nome`) depois do hardening —
  nada quebrou; `authenticated` é bloqueado de setar `pago`/`planoCerimonialista`
  direto, tanto em `weddings` quanto em `profiles`. (2) Webhook de ponta a
  ponta contra o servidor `next dev` rodando de verdade: eventos
  `checkout.session.completed`/`customer.subscription.created`/`deleted`
  assinados de verdade (`stripe.webhooks.generateTestHeaderString`) e
  enviados por HTTP pro endpoint real — `weddings.pago` e
  `profiles.planoCerimonialista` mudam exatamente como esperado, e uma
  assinatura forjada é rejeitada com 400 antes de qualquer escrita.
- **Teste local do webhook**: `stripe listen --forward-to
localhost:3000/api/stripe/webhook` (Stripe CLI, instalado via
  `brew install stripe/stripe-cli/stripe`) imprime um `whsec_...` — vai em
  `STRIPE_WEBHOOK_SECRET` no `.env.local`. Em produção/Vercel, o mesmo
  endpoint é cadastrado no Dashboard (Developers > Webhooks) apontando pra
  URL de produção, com seu próprio `whsec_` — variável de ambiente
  diferente da local, mesma forma de configurar (Vercel env vars).
- **`/pagamento/sucesso` não confirma nada sozinha**: o layout pai
  (`/pagamento/layout.tsx`) já redireciona pra `/app` assim que
  `wedding.pago` vira `true` — a página de sucesso só existe pra cobrir o
  intervalo entre o redirect do Stripe de volta e o webhook chegar
  (tipicamente 1-2s), com um `router.refresh()` a cada 2s até o layout
  pegar a mudança. Nunca se confia no redirect de sucesso do Checkout por
  si só pra liberar acesso — só o webhook, confirmado pela assinatura,
  decide isso.
- **"Gerenciar assinatura" usa o Customer Portal padrão do Stripe**
  (`stripe.billingPortal.sessions.create`), sem UI própria de trocar
  cartão/cancelar — cobre cancelamento e atualização de pagamento de
  imediato; trocar de plano pelo portal (em vez de assinar um novo) exige
  habilitar "subscription update" na configuração do portal no Dashboard
  do Stripe, não feito nesta fase (ainda em modo teste).

## Fase 15 — Rebranding da landing page

Pedido explícito: a landing (`/`) estava "sem graça" — texto simples
centralizado, sem imagem, sem hierarquia visual — e precisava chamar mais
atenção pra converter visita em cadastro. Diferente das fases anteriores,
não houve pergunta prévia: é execução de design dentro de uma direção clara
("total rebranding, chamar atenção"), não uma decisão de arquitetura.

- **Exceção pontual documentada às regras de "sem gradiente/sombra pesada"**
  (ver decisão de Paleta acima): só na landing/marketing pública, não na
  área logada nem no site público do casal — a superfície de venda pode ser
  mais expressiva que o produto em si. Usado com moderação: gradiente
  radial suave no hero (`from-primary/15` esmaecendo pro fundo, mais um
  blur decorativo), `shadow-sm`/`shadow-lg shadow-black/5` em cards (nunca
  sombra opaca/pesada).
- **Hero com mockup do painel** (`PreviaPainel`, componente interno de
  `hero.tsx`): card estático (HTML/CSS puro, sem imagem real nem
  screenshot) simulando um resumo de casamento — anel de progresso via
  `conic-gradient`, 2 itens de checklist marcados, barra de orçamento.
  Serve pra dar credibilidade visual ("é assim que fica") sem precisar de
  asset de design nenhum nem expor dado de conta real.
- **`PainSection` + `BeforeAfter` viraram um componente só**
  (`ProblemaSolucao`) — as duas seções antigas repetiam a mesma lista de
  dores ("planilha em aba separada", "grupo de WhatsApp lotado"...) de
  jeitos ligeiramente diferentes. Consolidado num cartão único dividido ao
  meio (❌ vermelho/❌ mudo de um lado, ✅ verde-oliva do outro) — mais
  direto e sem repetir a mesma dor duas vezes na mesma página.
- **Ícones em emblema colorido** (círculo `bg-primary/10 text-primary`)
  em vez de ícone solto, em `FeaturesGrid` e no cartão de
  `ProblemaSolucao` — com hover invertendo pra `bg-primary` sólido nos
  cards de funcionalidade, dando uma resposta visual ao passar o mouse
  sem precisar de JS.
- **`FinalCta` virou um "outdoor" de fechamento**: banner
  `bg-primary text-primary-foreground` de ponta a ponta (antes era só
  texto simples) — contraste forte de propósito, é a última coisa antes
  do rodapé, deveria ser a mais chamativa da página.
- **Copy de "Começar grátis" corrigido pra refletir a Fase 14**: antes do
  Stripe existir, o app inteiro era de fato grátis; agora só o
  cadastro/onboarding é (o pagamento único da noiva acontece depois, ao
  tentar entrar em `/app` — ver Fase 14). Trocado por "Começar agora" nos
  botões (header, hero) e "de graça, sem cartão" como qualificador mais
  preciso no `FinalCta`, em vez de "grátis" sozinho, que ficaria
  tecnicamente falso depois que ela termina o onboarding.
- **Larguras padronizadas em `max-w-6xl`** (header, footer, `Hero`,
  `FeaturesGrid`, `SocialProof`, `PricingSection`) — a maioria das seções
  ainda estava em `max-w-5xl`/`max-w-3xl` old, deixando bastante espaço
  vazio nas laterais em telas largas.
- **Ritmo vertical consistente**: `py-20` em vez de `py-16` nas seções
  principais, e um rótulo pequeno em maiúsculas (`text-primary text-sm
tracking-widest uppercase`, ex. "TUDO INCLUSO", "PREÇOS", "DÚVIDAS") acima
  do título de cada seção — mesmo padrão repetido dá uma "assinatura
  visual" à página que ela não tinha antes (cada seção com título solto,
  sem hierarquia entre elas).
- **Logo do header ganhou monograma**: círculo `bg-primary` com a inicial
  de `NOME_PRODUTO` ao lado do nome por extenso — mesma ideia visual do
  favicon (`src/app/icon.tsx`, Fase 9), reforçando marca no topo da página
  que mais gente vê.

## Fase 16 — Nome definitivo

Pedido explícito da dona: trocar o nome provisório "Meu Casamento" por
"Organiza meu Casamento" — principal motivo, alinhar o nome exibido com o
domínio já em uso em produção (`organiza-meu-casamento.vercel.app`), que
antes não batiam.

- **Só mexeu em `NOME_PRODUTO`** (`src/lib/site.ts`) — nenhuma outra string
  hardcoded com "Meu Casamento" existia no código (confirmado por busca);
  era exatamente o isolamento que a Fase 1 previu ("trocar aqui quando
  definirem o nome final").
- **Favicon: monograma "M" → "O" (letra inicial do nome novo)** — tentamos
  também uma versão com desenho de aliança (dois círculos aninhados,
  `icon.tsx`/`apple-icon.tsx`: círculo cor de destaque por fora, círculo
  cor de fundo por dentro criando o "furo" do anel) no lugar da letra, mas
  a dona achou que não ficou como imaginava e pediu pra voltar ao
  monograma — revertido de volta pra "O" no mesmo dia. Fica registrado
  que a ideia foi tentada e descartada, pra não repetir a mesma sugestão
  se o tema voltar.
- **Bug real de middleware encontrado testando o favicon novo**:
  `/apple-icon` redirecionava pra `/entrar` pra quem não estava logada —
  ou seja, pra praticamente todo mundo que visita o site pela primeira
  vez, o ícone da Apple nunca carregava. Causa: `isAppRoute` em
  `src/lib/supabase/middleware.ts` fazia `pathname.startsWith("/app")`
  sem limite de barra, e `"/apple-icon".startsWith("/app")` é `true`
  (substring, não segmento de rota) — mesma classe de bug já corrigida em
  `itemNavAtivo` (nav "Convidados" acendendo junto com "Mesas"). Corrigido
  com o mesmo padrão: `comecaComSegmento(pathname, prefixo)` exige
  `pathname === prefixo || pathname.startsWith(prefixo + "/")`, aplicado
  tanto nos prefixos de área logada quanto nos de auth pública. Existia
  desde a Fase 3 (quando `/app` virou prefixo protegido pela primeira
  vez) — só apareceu agora porque nada antes desta fase tinha motivo pra
  testar `/apple-icon` deslogada.
- **`short_name` do manifest (PWA) não é mais igual a `name`**: "Organiza
  meu Casamento" inteiro não cabe no rótulo do ícone de tela inicial
  (Android/iOS truncam perto de 12 caracteres) — `short_name` virou
  "Organiza", só `name` (usado em outros contextos, sem limite de
  caracteres) continua com o nome completo.
- **README.md atualizado** pro nome novo (era só usado como título do
  repositório, não afeta nada em runtime).
- Nome ainda pode não ser 100% definitivo apesar do título desta fase —
  `NOME_PRODUTO` continua isolado num lugar só exatamente por isso.

## Fase 17 — 2º rebranding da landing page

Pedido explícito da dona, depois de já ter passado pelo rebranding da Fase
15: "algo melhor e mais atrativo" pra `/`. Diferente da Fase 15 (que foi a
primeira vez que a landing ganhou qualquer tratamento visual — gradiente,
sombra, mockup), esta fase é uma 2ª iteração em cima de uma base que já
tinha identidade — o objetivo foi adicionar textura e variedade visual sem
recomeçar do zero nem mexer no que já funcionava (paleta, tipografia,
larguras `max-w-6xl`).

- **Seção nova "Como funciona"** (`como-funciona.tsx`), entre o hero e
  "Problema/Solução": 3 passos numerados (contar sobre o casamento → receber
  checklist/orçamento prontos → organizar com a equipe) ligados por uma
  linha horizontal atrás dos círculos numerados (`sm:` pra cima; empilha sem
  linha no mobile). Não existia nenhuma seção explicando o fluxo de uso
  antes de vender preço — só "o que tem" (`FeaturesGrid`), nunca "como é
  usar".
- **`FeaturesGrid` virou um grid "bento"**: antes 8 cards uniformes (ícone +
  título + descrição, todos do mesmo tamanho); agora o primeiro card
  ("Site público do casal") ocupa 2 colunas e ganhou um mini mockup de
  navegador ao lado (barra de URL falsa + tarja com gradiente + nome do
  casal) — mesma técnica CSS-only da Fase 9 (sem screenshot nem asset),
  chamando atenção pro recurso mais visual do produto (a página pública,
  Fase 8/10) em vez de deixá-lo como mais um ícone igual aos outros.
- **Hero ganhou profundidade**: fundo com grid de pontos sutil
  (`radial-gradient` repetido via `backgroundSize`, mascarado com
  `mask-image` radial pra sumir nas bordas) atrás do gradiente que já
  existia, mais 2 cartõezinhos flutuantes sobre o mockup do painel ("68
  tarefas geradas na hora", "Equipe toda num só lugar") — escondidos abaixo
  de `sm:` pra não brigar por espaço no mobile, onde o mockup já ocupa a
  largura toda.
- **Depoimentos ganharam avatar** (círculo com iniciais, mesma cor de
  destaque) no lugar de só o nome do papel abaixo de uma linha — reforça
  "pessoa de verdade falando" mesmo sem foto real disponível.
- **`FinalCta` ganhou 2 círculos decorativos desfocados** (mesma técnica do
  hero) atrás do texto, pro banner de fechamento não ficar uma cor sólida
  lisa demais.
- **Conteúdo/copy não mudou** (textos de funcionalidades, preços, FAQ,
  problema/solução) — o pedido era visual, não de mensagem; mexer em copy
  que já tinha sido revisado (Fase 15) sem pedido explícito seria risco
  desnecessário.

## Fase 18 — Rebranding do dashboard

Pedido explícito da dona: "rebranding" do dashboard (`/app`, Fase 4) mais
"informativos relevantes". Diferente das Fases 15/17 (landing pública, onde
gradiente/sombra são liberados de propósito — ver decisão de Paleta), o
dashboard é área logada: a diretriz "sem gradiente, sem sombra pesada" para
dentro do produto continua valendo integralmente aqui. O trabalho foi todo
em densidade de informação e hierarquia visual, não em efeitos.

- **`ProgressRing`** (`src/components/app/progress-ring.tsx`): anel de
  progresso só em CSS (`conic-gradient`), sem trazer recharts (usado hoje só
  no donut de categorias do orçamento, um Client Component) pro dashboard —
  um número só não justifica sair do Server Component por padrão. Mesma
  técnica do mockup estático da landing (`marketing/hero.tsx`, Fase 15),
  agora com dado real; aceita uma prop `destaque` que troca a cor do anel
  pra `--destructive` (usada quando o orçamento estourou).
- **3 cards existentes ganharam o anel**: Checklist (% concluído, já
  calculado antes só pra alimentar um `<Progress>` linear — trocado pelo
  anel), Orçamento (% pago do previsto, anel fica na cor de alerta quando
  contratado > previsto — mesma convenção já usada dentro do módulo de
  orçamento em si, Fase 5, só que essa comparação nunca tinha chegado ao
  card do dashboard) e RSVP (% de convidados que já responderam, confirmado
  ou recusado).
- **RSVP ganhou "pessoas confirmadas (com acompanhantes)"**: o card só
  contava linhas de `guests`, então uma confirmação com 2 acompanhantes
  contava como 1 — inútil pra saber quanta gente vai de verdade (buffet,
  lugar sentado). `getDashboardData` passou a somar `1 + acompanhantes` só
  de quem confirmou, virou `rsvp.pessoasConfirmadas`.
- **Card novo, "Fornecedores"** (`vendors-card.tsx`): contratados de total —
  módulo que já existia (Fase 5) mas não tinha nenhuma presença no
  dashboard. Mesma consulta agregada dentro da única transação de
  `getDashboardData` (sem N+1, mesmo padrão das outras 6 métricas).
- **`CountdownCard` ganhou data e local**: antes só o número de dias; agora
  mostra também a data por extenso no formato padrão (`formatDate`,
  dd/MM/yyyy — sem inventar um formato "por extenso" novo, a convenção de
  datas do projeto já é essa) e o local da festa (+ cidade/estado, se
  preenchidos) — dado que já existia em `weddings` e não aparecia em lugar
  nenhum do dashboard. Fundo `bg-primary/5` sutil (token já usado em outros
  destaques do app, ex. badge do plano ativo) pra diferenciar da grade de
  cards comuns sem recorrer a gradiente.
- **`AlertsCard`/`NextTasksCard` ganharam ícone por linha** (alerta
  vermelho, tarefa com marcador neutro) — pequeno reforço visual, sem mudar
  a lógica.
- **6º card no grid**: `xl:grid-cols-3` já comportava sem quebrar layout (2
  linhas de 3 em vez de quase-2-linhas de 5); skeleton (`dashboard-skeleton.tsx`)
  ajustado de 5 pra 6 placeholders pra bater com o real.

## Como rodar localmente

Ver `README.md`.
