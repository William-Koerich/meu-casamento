# CLAUDE.md — Meu Casamento

SaaS de planejamento de casamento em português do Brasil. "Meu Casamento" é
nome provisório — está isolado em `src/lib/site.ts` (constante `NOME_PRODUTO`)
para trocar em um lugar só quando definirem o nome final.

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

- **Nome do produto**: "Meu Casamento" isolado em `src/lib/site.ts`.
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
  (0.25rem). Sem gradiente, sem sombra pesada, sem glassmorphism.
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
- **Preço é placeholder**: os dois planos em `PricingSection`
  (`Essencial` grátis / `Completo` R$ 149 pagamento único) são um valor
  fictício para preencher a landing — o modelo de negócio real (preço,
  se é assinatura ou pagamento único, o que cada plano libera de fato)
  ainda não foi decidido e precisa ser substituído antes do lançamento.
- **Favicon/ícones gerados por código**: `src/app/icon.tsx` e
  `apple-icon.tsx` usam `next/og` (`ImageResponse`) para desenhar um
  monograma "M" na cor de destaque, em vez de depender de um arquivo de
  imagem pronto — não há nenhum arquivo de design disponível ainda. Troque
  por um ícone de verdade quando a identidade visual for definida.
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
- **Foto de capa com posição ajustável**: `weddings.fotoCapaPosicaoX/Y`
  (percentual 0-100, migration `0004`) guarda o `object-position` da foto de
  capa. `CoverPhoto` (Configurações) deixa arrastar a prévia da foto
  (Pointer Events, funciona com mouse e touch) para reenquadrar sem precisar
  cortar/reenviar a imagem — salva ao soltar, via
  `atualizarPosicaoFotoCapa`. A página pública (`/c/[slug]`) aplica o mesmo
  `object-position` na foto de capa de fundo. Como são colunas novas em
  `weddings`, entraram também no grant de coluna pra `anon` (migration
  `0004`) e no `columns` explícito de `getWeddingPublicaPorSlug` — sem isso
  a leitura pública quebraria com "permission denied" (ver "Grants de coluna
  para anon" e "Queries públicas sempre limitam columns" acima).
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
- **Link da página pública em Configurações**: o campo de endereço mostrava
  um domínio de exemplo fixo ("meucasamento.com") em vez do domínio real do
  deploy. Trocado para usar `NEXT_PUBLIC_APP_URL` (a mesma variável já usada
  em `robots.ts`/`sitemap.ts`/convites) e exibir o link completo e clicável
  da página pública, com botão de copiar.

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

## Como rodar localmente

Ver `README.md`.
