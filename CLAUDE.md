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

## Fases

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
- [ ] **Fase 4 — Layout e dashboard**: sidebar/bottom nav, header com
      contagem regressiva, dashboard com cards e skeletons.
- [ ] **Fase 5 — Checklist, orçamento e fornecedores**.
- [ ] **Fase 6 — Convidados, mesas e RSVP**.
- [ ] **Fase 7 — Módulos restantes** (cronograma, inspirações, playlist,
      presentes, enxoval, lua de mel, documentos, equipe, configurações,
      exportar).
- [ ] **Fase 8 — Página pública do casal** (`/c/[slug]`).
- [ ] **Fase 9 — Marketing e finalização**.

## Como rodar localmente

Ver `README.md`.
