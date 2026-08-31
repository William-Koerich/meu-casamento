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

## Fases

- [x] **Fase 1 — Fundação**: Next 15 + TS strict + Tailwind v4 + shadcn/ui,
      clientes Supabase (browser/server/middleware), Drizzle configurado,
      Prettier, `.env.example`, README, estrutura de pastas, paleta e
      tipografia editorial nos tokens globais.
- [ ] **Fase 2 — Modelo de dados**: schema Drizzle completo, migrations, RLS,
      seed com casamento de exemplo.
- [ ] **Fase 3 — Auth e onboarding**: entrar/cadastro/recuperação de senha,
      middleware, wizard de 5 telas em `/inicio`, geração automática de
      categorias de orçamento e checklist de 12 meses.
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
