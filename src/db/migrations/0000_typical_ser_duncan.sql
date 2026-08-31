CREATE TYPE "public"."categoria" AS ENUM('local', 'buffet', 'decoracao', 'fotografia', 'vestuario', 'beleza', 'musica', 'convites', 'documentacao', 'transporte', 'lembrancinhas', 'bolo_doces', 'cerimonial', 'lua_de_mel', 'outros');--> statement-breakpoint
CREATE TYPE "public"."comodo_enxoval" AS ENUM('cozinha', 'sala', 'quarto', 'banheiro', 'lavanderia', 'area_externa', 'outros');--> statement-breakpoint
CREATE TYPE "public"."formato_mesa" AS ENUM('redonda', 'retangular', 'imperial');--> statement-breakpoint
CREATE TYPE "public"."grupo_convidado" AS ENUM('familia_noiva', 'familia_noivo', 'amigos_noiva', 'amigos_noivo', 'trabalho', 'outros');--> statement-breakpoint
CREATE TYPE "public"."lado_convidado" AS ENUM('noiva', 'noivo', 'ambos');--> statement-breakpoint
CREATE TYPE "public"."momento_musica" AS ENUM('entrada_noivo', 'entrada_padrinhos', 'entrada_noiva', 'durante_cerimonia', 'saida', 'recepcao', 'valsa', 'festa', 'nunca_tocar');--> statement-breakpoint
CREATE TYPE "public"."origem_tarefa" AS ENUM('template', 'manual');--> statement-breakpoint
CREATE TYPE "public"."papel_membro" AS ENUM('dona', 'noivo', 'familiar', 'padrinho_madrinha', 'cerimonialista');--> statement-breakpoint
CREATE TYPE "public"."permissao_membro" AS ENUM('admin', 'editor', 'leitor');--> statement-breakpoint
CREATE TYPE "public"."prioridade_enxoval" AS ENUM('alta', 'media', 'baixa');--> statement-breakpoint
CREATE TYPE "public"."status_fornecedor" AS ENUM('pesquisando', 'contatado', 'proposta_recebida', 'contratado', 'descartado');--> statement-breakpoint
CREATE TYPE "public"."status_rsvp" AS ENUM('pendente', 'confirmado', 'recusado');--> statement-breakpoint
CREATE TYPE "public"."tipo_documento" AS ENUM('contrato', 'certidao', 'orcamento', 'recibo', 'outro');--> statement-breakpoint
-- "auth"."users" já existe (gerenciada pelo Supabase Auth) — não é criada aqui,
-- só referenciada pelas foreign keys abaixo.
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"avatar_url" text,
	"telefone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "weddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"nome_noiva" text NOT NULL,
	"nome_noivo" text NOT NULL,
	"data_casamento" date,
	"hora_cerimonia" time,
	"local_cerimonia" text,
	"endereco_cerimonia" text,
	"local_festa" text,
	"endereco_festa" text,
	"cidade" text,
	"estado" text,
	"orcamento_total" numeric(12, 2),
	"convidados_estimados" integer,
	"estilo" text,
	"historia_casal" text,
	"foto_capa_url" text,
	"dress_code" text,
	"slug" text NOT NULL,
	"publicado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weddings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "weddings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wedding_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"user_id" uuid,
	"papel" "papel_membro" NOT NULL,
	"permissao" "permissao_membro" NOT NULL,
	"convite_email" text NOT NULL,
	"convite_token" text NOT NULL,
	"convite_aceito_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wedding_members_convite_token_unique" UNIQUE("convite_token")
);
--> statement-breakpoint
ALTER TABLE "wedding_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"categoria" "categoria" NOT NULL,
	"meses_antes" integer,
	"prazo" date,
	"concluida" boolean DEFAULT false NOT NULL,
	"concluida_em" timestamp with time zone,
	"responsavel_id" uuid,
	"ordem" integer DEFAULT 0 NOT NULL,
	"origem" "origem_tarefa" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"categoria" "categoria" NOT NULL,
	"contato_nome" text,
	"telefone" text,
	"email" text,
	"instagram" text,
	"site" text,
	"valor_proposto" numeric(12, 2),
	"status" "status_fornecedor" DEFAULT 'pesquisando' NOT NULL,
	"avaliacao" integer,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "budget_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"valor_previsto" numeric(12, 2) NOT NULL,
	"cor" text,
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"vendor_id" uuid,
	"descricao" text NOT NULL,
	"valor_previsto" numeric(12, 2),
	"valor_contratado" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"budget_item_id" uuid NOT NULL,
	"descricao" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"vencimento" date NOT NULL,
	"pago" boolean DEFAULT false NOT NULL,
	"pago_em" timestamp with time zone,
	"forma_pagamento" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"capacidade" integer NOT NULL,
	"formato" "formato_mesa" DEFAULT 'redonda' NOT NULL,
	"pos_x" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pos_y" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tables" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"email" text,
	"telefone" text,
	"grupo" "grupo_convidado" NOT NULL,
	"lado" "lado_convidado" NOT NULL,
	"acompanhantes" integer DEFAULT 0 NOT NULL,
	"crianca" boolean DEFAULT false NOT NULL,
	"restricao_alimentar" text,
	"status_rsvp" "status_rsvp" DEFAULT 'pendente' NOT NULL,
	"respondido_em" timestamp with time zone,
	"table_id" uuid,
	"convite_enviado_em" timestamp with time zone,
	"codigo_rsvp" text NOT NULL,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guests_codigo_rsvp_unique" UNIQUE("codigo_rsvp")
);
--> statement-breakpoint
ALTER TABLE "guests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"horario" time NOT NULL,
	"duracao_minutos" integer DEFAULT 30 NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"responsavel" text,
	"local" text,
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "timeline_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inspirations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"titulo" text,
	"imagem_url" text,
	"link_externo" text,
	"categoria" text,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inspirations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"artista" text,
	"momento" "momento_musica" NOT NULL,
	"spotify_url" text,
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "songs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"imagem_url" text,
	"preco" numeric(12, 2),
	"link_loja" text,
	"chave_pix" text,
	"reservado_por_nome" text,
	"reservado_por_email" text,
	"reservado_em" timestamp with time zone,
	"recebido" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gifts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "trousseau_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"comodo" "comodo_enxoval" NOT NULL,
	"quantidade" integer DEFAULT 1 NOT NULL,
	"prioridade" "prioridade_enxoval" DEFAULT 'media' NOT NULL,
	"preco_estimado" numeric(12, 2),
	"comprado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trousseau_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "honeymoon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"destino" text,
	"data_ida" date,
	"data_volta" date,
	"orcamento" numeric(12, 2),
	"roteiro" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"checklist_mala" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "honeymoon_wedding_id_unique" UNIQUE("wedding_id")
);
--> statement-breakpoint
ALTER TABLE "honeymoon" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tipo_documento" NOT NULL,
	"arquivo_url" text NOT NULL,
	"vendor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weddings" ADD CONSTRAINT "weddings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_members" ADD CONSTRAINT "wedding_members_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_members" ADD CONSTRAINT "wedding_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_responsavel_id_users_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_category_id_budget_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."budget_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_budget_item_id_budget_items_id_fk" FOREIGN KEY ("budget_item_id") REFERENCES "public"."budget_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables" ADD CONSTRAINT "tables_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspirations" ADD CONSTRAINT "inspirations_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trousseau_items" ADD CONSTRAINT "trousseau_items_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honeymoon" ADD CONSTRAINT "honeymoon_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wedding_members_wedding_id_idx" ON "wedding_members" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "wedding_members_user_id_idx" ON "wedding_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_wedding_id_idx" ON "tasks" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "tasks_responsavel_id_idx" ON "tasks" USING btree ("responsavel_id");--> statement-breakpoint
CREATE INDEX "vendors_wedding_id_idx" ON "vendors" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "budget_categories_wedding_id_idx" ON "budget_categories" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "budget_items_wedding_id_idx" ON "budget_items" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "budget_items_category_id_idx" ON "budget_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "budget_items_vendor_id_idx" ON "budget_items" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "payments_wedding_id_idx" ON "payments" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "payments_budget_item_id_idx" ON "payments" USING btree ("budget_item_id");--> statement-breakpoint
CREATE INDEX "tables_wedding_id_idx" ON "tables" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "guests_wedding_id_idx" ON "guests" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "guests_table_id_idx" ON "guests" USING btree ("table_id");--> statement-breakpoint
CREATE INDEX "timeline_events_wedding_id_idx" ON "timeline_events" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "inspirations_wedding_id_idx" ON "inspirations" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "songs_wedding_id_idx" ON "songs" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "gifts_wedding_id_idx" ON "gifts" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "trousseau_items_wedding_id_idx" ON "trousseau_items" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "documents_wedding_id_idx" ON "documents" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "documents_vendor_id_idx" ON "documents" USING btree ("vendor_id");--> statement-breakpoint
