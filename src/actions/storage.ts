"use server"

import { createClient } from "@/lib/supabase/server"

export async function obterUrlAssinada(
  bucket: string,
  caminho: string,
  expiraEmSegundos = 3600
): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(caminho, expiraEmSegundos)

  if (error || !data) return null
  return data.signedUrl
}

export async function obterUrlsAssinadas(
  bucket: string,
  caminhos: string[],
  expiraEmSegundos = 3600
): Promise<Record<string, string>> {
  if (caminhos.length === 0) return {}

  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(caminhos, expiraEmSegundos)

  if (error || !data) return {}

  const mapa: Record<string, string> = {}
  for (const item of data) {
    if (item.signedUrl && item.path) mapa[item.path] = item.signedUrl
  }
  return mapa
}
