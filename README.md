# Meu Casamento

SaaS de planejamento de casamento em português do Brasil. Nome provisório —
veja `src/lib/site.ts`.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase
(Postgres, Auth, Storage, RLS) · Drizzle ORM · React Hook Form + Zod ·
date-fns · recharts · dnd-kit.

Detalhes de arquitetura e convenções: veja [`CLAUDE.md`](./CLAUDE.md).

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- Uma conta e um projeto no [Supabase](https://supabase.com)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha no `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` — em
  **Project Settings > API** no painel do Supabase.
- `DATABASE_URL` — em **Project Settings > Database > Connection string**.
  Use a connection string direta (porta 5432) para rodar migrations e seed
  localmente.
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` em desenvolvimento.

### 3. Criar o schema no banco

```bash
npm run db:push   # aplica o schema do Drizzle direto no Postgres do Supabase
```

Para gerar arquivos de migration versionados em vez de aplicar direto:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Popular com dados de exemplo (opcional)

```bash
npm run db:seed
```

### 5. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                 | Descrição                                       |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                     |
| `npm run build`        | Build de produção                               |
| `npm run start`        | Serve o build de produção                       |
| `npm run lint`         | ESLint                                          |
| `npm run format`       | Formata o projeto com Prettier                  |
| `npm run format:check` | Checa formatação sem alterar arquivos           |
| `npm run db:generate`  | Gera migrations a partir do schema Drizzle      |
| `npm run db:push`      | Aplica o schema direto no banco (sem migration) |
| `npm run db:migrate`   | Aplica migrations geradas                       |
| `npm run db:studio`    | Abre o Drizzle Studio                           |
| `npm run db:seed`      | Popula o banco com um casamento de exemplo      |

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente (as mesmas do `.env.example`) em
   **Project Settings > Environment Variables**.
3. Rode as migrations contra o banco de produção antes do primeiro deploy
   (`npm run db:push` ou `db:migrate` apontando `DATABASE_URL` para produção).
4. No Supabase, crie os buckets de Storage (`inspiracoes`, `presentes`,
   `documentos`, `capas`) — o seed/migrations cuidam disso quando definidos
   via SQL, ou crie manualmente pelo painel se preferir.
5. Deploy. O build padrão da Vercel (`npm run build`) já é o usado neste
   projeto.
