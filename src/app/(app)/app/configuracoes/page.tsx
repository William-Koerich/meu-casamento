import type { Metadata } from "next"

import { getMinhaWedding } from "@/db/queries/weddings"
import { createClient } from "@/lib/supabase/server"

import { CoverPhoto } from "./cover-photo"
import { DangerZone } from "./danger-zone"
import { SettingsForm } from "./settings-form"
import { SlugAndPublish } from "./slug-and-publish"

export const metadata: Metadata = { title: "Configurações" }

export default async function ConfiguracoesPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Configurações</h1>
      <SettingsForm wedding={wedding} />
      <CoverPhoto
        weddingId={wedding.id}
        fotoCapaUrl={wedding.fotoCapaUrl}
        fotoCapaPosicaoX={wedding.fotoCapaPosicaoX}
        fotoCapaPosicaoY={wedding.fotoCapaPosicaoY}
      />
      <SlugAndPublish slug={wedding.slug} publicado={wedding.publicado} />
      <DangerZone souDona={user?.id === wedding.ownerId} />
    </div>
  )
}
