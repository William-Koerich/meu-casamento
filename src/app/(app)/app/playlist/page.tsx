import type { Metadata } from "next"

import { getSongs } from "@/db/queries/songs"
import { getMinhaWedding } from "@/db/queries/weddings"

import { PlaylistView } from "./playlist-view"

export const metadata: Metadata = { title: "Playlist" }

export default async function PlaylistPage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const musicas = await getSongs(wedding.id)

  return (
    <div>
      <h1 className="font-heading mb-6 text-2xl">Playlist</h1>
      <PlaylistView musicas={musicas} />
    </div>
  )
}
