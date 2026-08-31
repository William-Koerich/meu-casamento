"use client"

import { useMemo, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"

import { excluirInspiracao } from "@/actions/inspirations"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { Inspiracao } from "@/db/queries/inspirations"

type ItemComUrl = Inspiracao & { urlAssinada: string | null }

export function Moodboard({ itens }: { itens: ItemComUrl[] }) {
  const [selecionado, setSelecionado] = useState<ItemComUrl | null>(null)

  const grupos = useMemo(() => {
    const mapa = new Map<string, ItemComUrl[]>()
    for (const item of itens) {
      const chave = item.categoria || "Sem categoria"
      if (!mapa.has(chave)) mapa.set(chave, [])
      mapa.get(chave)!.push(item)
    }
    return [...mapa.entries()]
  }, [itens])

  if (itens.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Nenhuma inspiração salva ainda.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {grupos.map(([categoria, itensDoGrupo]) => (
        <div key={categoria}>
          <h2 className="font-heading mb-3 text-lg">{categoria}</h2>
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {itensDoGrupo.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelecionado(item)}
                className="border-border bg-card mb-3 block w-full break-inside-avoid rounded border text-left"
              >
                {item.urlAssinada ? (
                  <Image
                    src={item.urlAssinada}
                    alt={item.titulo ?? ""}
                    width={400}
                    height={400}
                    className="w-full rounded-t object-cover"
                    unoptimized
                  />
                ) : (
                  <p className="text-muted-foreground p-4 text-xs">Link externo</p>
                )}
                {(item.titulo || item.notas) && (
                  <div className="p-2">
                    {item.titulo && (
                      <p className="truncate text-xs font-medium">{item.titulo}</p>
                    )}
                    {item.notas && (
                      <p className="text-muted-foreground line-clamp-2 text-xs">
                        {item.notas}
                      </p>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <Dialog
        open={!!selecionado}
        onOpenChange={(aberto) => !aberto && setSelecionado(null)}
      >
        <DialogContent className="max-w-2xl">
          {selecionado && (
            <>
              <DialogTitle>{selecionado.titulo || "Inspiração"}</DialogTitle>
              {selecionado.urlAssinada && (
                <Image
                  src={selecionado.urlAssinada}
                  alt={selecionado.titulo ?? ""}
                  width={800}
                  height={800}
                  className="max-h-[70vh] w-full rounded object-contain"
                  unoptimized
                />
              )}
              {selecionado.linkExterno && (
                <Link
                  href={selecionado.linkExterno}
                  target="_blank"
                  className="text-sm underline"
                >
                  {selecionado.linkExterno}
                </Link>
              )}
              {selecionado.notas && <p className="text-sm">{selecionado.notas}</p>}
              <ExcluirBotao id={selecionado.id} aoExcluir={() => setSelecionado(null)} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ExcluirBotao({ id, aoExcluir }: { id: string; aoExcluir: () => void }) {
  const [, iniciarTransicao] = useTransition()

  return (
    <button
      type="button"
      onClick={() =>
        iniciarTransicao(async () => {
          await excluirInspiracao(id)
          aoExcluir()
        })
      }
      className="text-destructive flex items-center gap-1 text-sm"
    >
      <Trash2 className="size-4" />
      Excluir
    </button>
  )
}
