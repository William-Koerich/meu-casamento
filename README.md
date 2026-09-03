# Organiza meu Casamento

SaaS de planejamento de casamento em português do Brasil. Nome do produto
isolado em `src/lib/site.ts`.

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
  **Project Settings > API** no painel do Supabase (a chave pode aparecer
  como "anon" ou "publishable", dependendo de quando o projeto foi criado —
  é a mesma coisa, use o valor que o painel mostrar).
- `DATABASE_URL` — em **Project Settings > Database > Connection string**.
  Use a connection string direta (porta 5432) para rodar migrations e seed
  localmente.
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` em desenvolvimento.

Nunca cole valores reais em `.env.example` — só em `.env.local` (que já está
no `.gitignore`).

### 3. Configurar autenticação no Supabase

Em **Authentication > URL Configuration**, defina a **Site URL** como
`http://localhost:3000` em desenvolvimento (ou a URL do deploy em produção)
e adicione `.../auth/callback` às **Redirect URLs** — é para onde o login
com Google e os links de e-mail (recuperação de senha, confirmação de
cadastro) redirecionam depois de autenticar.

Para o login com Google, ative o provider em **Authentication > Providers >
Google** com as credenciais OAuth do Google Cloud Console.

### 4. Criar o schema no banco

```bash
npm run db:push   # aplica o schema do Drizzle direto no Postgres do Supabase
```

Para gerar arquivos de migration versionados em vez de aplicar direto:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Popular com dados de exemplo (opcional)

Preencha também `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (o script usa a
Admin API do Supabase Auth só localmente, para criar a usuária de
demonstração — nunca use essa chave em código da aplicação nem em produção).

```bash
npm run db:seed
```

Cria a usuária `mariana@exemplo.com` / `SenhaDemo123!` e um casamento de
exemplo completo (checklist de 12 meses, orçamento, fornecedores,
convidados, mesas, cronograma, playlist, presentes, enxoval, lua de mel e
documentos).

### 6. Rodar o servidor de desenvolvimento

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

1. Crie o projeto no Supabase (se ainda não tiver) e rode as migrations
   contra o banco de produção **antes do primeiro deploy**:
   ```bash
   DATABASE_URL="<connection string de produção>" npm run db:migrate
   ```
   As 4 migrations em `src/db/migrations/` rodam em ordem e já criam as
   tabelas, as policies de RLS, as funções auxiliares e os 4 buckets de
   Storage (`inspiracoes`, `presentes`, `documentos`, `capas`) — nada
   precisa ser criado manualmente no painel do Supabase.
2. Em **Authentication > URL Configuration** do Supabase, aponte a **Site
   URL** e as **Redirect URLs** para o domínio de produção (`.../auth/callback`)
   — sem isso, login com Google e links de e-mail redirecionam para
   `localhost`.
3. Importe o repositório na Vercel.
4. Configure as variáveis de ambiente em **Project Settings > Environment
   Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `DATABASE_URL` e `NEXT_PUBLIC_APP_URL` (a URL pública do deploy). **Não**
   defina `SUPABASE_SERVICE_ROLE_KEY` na Vercel — essa chave só é usada pelo
   script local de seed, nunca pela aplicação em produção.
5. Deploy. O build padrão da Vercel (`npm run build`) já é o usado neste
   projeto — não é preciso configuração extra de build.
