import type { Metadata } from "next"

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getEquipe } from "@/db/queries/members"
import { getMinhaWedding } from "@/db/queries/weddings"

import { InviteMemberDialog } from "./invite-member-dialog"
import { MemberRow } from "./member-row"

export const metadata: Metadata = { title: "Equipe" }

export default async function EquipePage() {
  const wedding = await getMinhaWedding()
  if (!wedding) return null

  const equipe = await getEquipe(wedding.id)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Equipe</h1>
        <InviteMemberDialog />
      </div>
      {equipe.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Ninguém convidado ainda. Convide o noivo, madrinhas, familiares ou a
          cerimonialista.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipe.map((membro) => (
                <MemberRow key={membro.id} membro={membro} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
