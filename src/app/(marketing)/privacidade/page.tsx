import type { Metadata } from "next"

import { NOME_PRODUTO } from "@/lib/site"

export const metadata: Metadata = {
  title: "Privacidade",
  description: `Como o ${NOME_PRODUTO} trata os dados do seu casamento.`,
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div>
        <h1 className="font-heading text-4xl">Política de privacidade</h1>
        <p className="text-muted-foreground mt-2 text-sm">Última atualização: 2026.</p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Esta política descreve como o {NOME_PRODUTO} coleta, usa e protege os dados de
          quem usa a plataforma para planejar o próprio casamento.
        </p>

        <h2 className="font-heading text-xl">Quais dados coletamos</h2>
        <p>
          Nome, e-mail e telefone de quem cria uma conta; dados do casamento (nomes do
          casal, data, local, orçamento, convidados, fornecedores) que você e sua equipe
          cadastram; e, quando você publica a página pública, as informações que os
          convidados enviam ao confirmar presença ou reservar um presente (nome, e-mail e,
          opcionalmente, restrição alimentar).
        </p>

        <h2 className="font-heading text-xl">Como usamos os dados</h2>
        <p>
          Só para fazer o produto funcionar: mostrar o seu planejamento para você e para
          quem você convidar, gerar a página pública quando você decidir publicá-la, e
          permitir que convidados confirmem presença. Não vendemos nem compartilhamos seus
          dados com terceiros para fins de marketing.
        </p>

        <h2 className="font-heading text-xl">Onde os dados ficam</h2>
        <p>
          Os dados são armazenados em um banco de dados Postgres gerenciado pelo Supabase,
          com controle de acesso por linha (row level security): cada casamento só é
          visível para a dona e para as pessoas que ela convidou.
        </p>

        <h2 className="font-heading text-xl">Seus direitos</h2>
        <p>
          Você pode editar seus dados a qualquer momento em Configurações, e excluir sua
          conta e todos os dados do seu casamento na mesma tela, de forma definitiva.
        </p>

        <h2 className="font-heading text-xl">Contato</h2>
        <p>
          Dúvidas sobre esta política podem ser enviadas para a nossa equipe de suporte.
        </p>
      </div>
    </div>
  )
}
