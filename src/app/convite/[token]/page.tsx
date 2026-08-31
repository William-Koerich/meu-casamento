import Link from "next/link"
import type { Metadata } from "next"

import { getConvitePorToken } from "@/db/queries/members"
import { PAPEL_MEMBRO_LABELS } from "@/lib/labels"
import { NOME_PRODUTO } from "@/lib/site"
import { createClient } from "@/lib/supabase/server"

import { AceitarConviteButton } from "./aceitar-convite-button"

export const metadata: Metadata = { title: "Convite" }

export default async function ConvitePage({ params }: PageProps<"/convite/[token]">) {
  const { token } = await params
  const convite = await getConvitePorToken(token)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="font-heading mb-10 text-2xl">
        {NOME_PRODUTO}
      </Link>
      <div className="border-border bg-card w-full max-w-sm space-y-4 rounded border p-8 text-center">
        {!convite ? (
          <p className="text-muted-foreground text-sm">
            Este convite não existe mais ou o link está incorreto.
          </p>
        ) : convite.conviteAceitoEm ? (
          <>
            <p className="text-sm">Este convite já foi aceito.</p>
            <Link href="/app" className="text-sm underline">
              Ir para o painel
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-heading text-xl">Convite para o casamento</h1>
            <p className="text-sm">
              {convite.wedding.nomeNoiva} & {convite.wedding.nomeNoivo} convidaram você
              para colaborar como <strong>{PAPEL_MEMBRO_LABELS[convite.papel]}</strong>.
            </p>
            {user ? (
              <AceitarConviteButton token={token} />
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Entre ou crie uma conta com o e-mail {convite.conviteEmail} para
                  aceitar.
                </p>
                <div className="flex justify-center gap-3">
                  <Link
                    href={`/entrar?redirecionar=${encodeURIComponent(`/convite/${token}`)}`}
                    className="underline"
                  >
                    Entrar
                  </Link>
                  <Link
                    href={`/cadastro?redirecionar=${encodeURIComponent(`/convite/${token}`)}`}
                    className="underline"
                  >
                    Criar conta
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
