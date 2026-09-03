import Link from "next/link"
import type { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NOME_PRODUTO } from "@/lib/site"

export const metadata: Metadata = {
  title: "Para cerimonialistas",
  description: `Acompanhe o cronograma, o checklist e os fornecedores de cada casamento pelo ${NOME_PRODUTO}.`,
}

const BENEFICIOS = [
  {
    titulo: "Cronograma sempre atualizado",
    descricao:
      "Veja o cronograma do dia em tempo real, do jeito que a noiva ajustou por último.",
  },
  {
    titulo: "Checklist compartilhado",
    descricao: "Acompanhe o que já foi resolvido sem precisar perguntar por WhatsApp.",
  },
  {
    titulo: "Contato dos fornecedores",
    descricao:
      "Telefone, categoria e status de cada fornecedor contratado, num só lugar.",
  },
]

export default function ParaCerimonialistasPage() {
  return (
    <div>
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Para cerimonialistas
        </p>
        <h1 className="font-heading mt-3 text-4xl">
          O planejamento da noiva, direto na sua mão
        </h1>
        <p className="text-muted-foreground mt-4">
          A noiva te convida para a equipe do casamento dela e você acompanha exatamente o
          que precisa — sem esperar print de planilha. Ou, se você atende vários casais ao
          mesmo tempo, crie sua própria conta profissional e cadastre o casamento de cada
          cliente você mesma.
        </p>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-6 pb-16 sm:grid-cols-3">
        {BENEFICIOS.map((item) => (
          <Card key={item.titulo}>
            <CardContent>
              <h2 className="font-heading text-lg">{item.titulo}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{item.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="border-border border-t px-6 py-16 text-center">
        <h2 className="font-heading text-2xl">Administra vários casamentos?</h2>
        <p className="text-muted-foreground mt-2">
          Crie uma conta profissional e cadastre o casamento de cada cliente com o mesmo
          login. Planos Básico, Premium e Platinum, por assinatura mensal.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/cadastro">Criar conta profissional</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/precos">Ver planos</Link>
          </Button>
        </div>
      </section>

      <section className="border-border border-t px-6 py-16 text-center">
        <h2 className="font-heading text-2xl">Já foi convidada para um casamento?</h2>
        <p className="text-muted-foreground mt-2">
          Use o link do convite que a noiva te enviou, ou entre com sua conta.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/entrar">Entrar</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
