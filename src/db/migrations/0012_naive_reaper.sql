CREATE TYPE "public"."nota_cor" AS ENUM('amarelo', 'rosa', 'azul', 'verde', 'lilas');--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wedding_id" uuid NOT NULL,
	"conteudo" text DEFAULT '' NOT NULL,
	"cor" "nota_cor" DEFAULT 'amarelo' NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notes_wedding_id_idx" ON "notes" USING btree ("wedding_id");--> statement-breakpoint
CREATE POLICY "notes_select" ON "notes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select public.is_wedding_member("notes"."wedding_id")));--> statement-breakpoint
CREATE POLICY "notes_insert" ON "notes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.can_edit_wedding("notes"."wedding_id")));--> statement-breakpoint
CREATE POLICY "notes_update" ON "notes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.can_edit_wedding("notes"."wedding_id"))) WITH CHECK ((select public.can_edit_wedding("notes"."wedding_id")));--> statement-breakpoint
CREATE POLICY "notes_delete" ON "notes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.can_edit_wedding("notes"."wedding_id")));