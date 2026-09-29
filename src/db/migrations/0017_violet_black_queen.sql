CREATE TABLE "rate_limits" (
	"chave" text NOT NULL,
	"janela" integer NOT NULL,
	"contagem" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "rate_limits_chave_janela_pk" PRIMARY KEY("chave","janela")
);
--> statement-breakpoint
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Sem policy nenhuma (RLS habilitada já nega tudo pra anon/authenticated
-- por padrão), mas revoga os grants amplos de tabela que o Supabase dá de
-- fábrica também, por clareza e defesa em profundidade — mesmo cuidado já
-- registrado no CLAUDE.md sobre grant de tabela inteira sobrepor RLS em
-- outros contextos (ver Fase 14, hardening de weddings.pago).
revoke all on table public.rate_limits from anon, authenticated;