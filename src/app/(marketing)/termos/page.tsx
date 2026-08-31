import type { Metadata } from "next"

import { NOME_PRODUTO } from "@/lib/site"

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Termos de uso do ${NOME_PRODUTO}.`,
}

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div>
        <h1 className="font-heading text-4xl">Termos de uso</h1>
        <p className="text-muted-foreground mt-2 text-sm">Última atualização: 2026.</p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Ao criar uma conta no {NOME_PRODUTO}, você concorda com estes termos. Leia com
          atenção.
        </p>

        <h2 className="font-heading text-xl">O que é o serviço</h2>
        <p>
          O {NOME_PRODUTO} é uma ferramenta de planejamento de casamento: checklist,
          orçamento, fornecedores, convidados, cronograma e uma página pública opcional
          para o casal compartilhar com os convidados.
        </p>

        <h2 className="font-heading text-xl">Sua conta</h2>
        <p>
          Você é responsável por manter sua senha em segurança e por tudo o que for feito
          com a sua conta. A dona do casamento pode convidar outras pessoas para
          colaborar, cada uma com um nível de permissão (administradora, editora ou
          leitora).
        </p>

        <h2 className="font-heading text-xl">Conteúdo que você envia</h2>
        <p>
          Você é responsável pelas informações e imagens que cadastra (fotos, textos,
          listas de convidados). Não envie conteúdo que você não tenha o direito de usar.
        </p>

        <h2 className="font-heading text-xl">Página pública</h2>
        <p>
          Ao publicar a página do seu casamento, as informações de vitrine (nomes, data,
          local, história do casal, foto de capa e lista de presentes) ficam acessíveis a
          quem tiver o link — inclusive mecanismos de busca, se você compartilhar
          publicamente. Você pode despublicar a página a qualquer momento em
          Configurações.
        </p>

        <h2 className="font-heading text-xl">Cancelamento</h2>
        <p>
          Você pode excluir sua conta quando quiser em Configurações. Se você for a dona
          do casamento, isso apaga permanentemente todos os dados daquele casamento.
        </p>

        <h2 className="font-heading text-xl">Alterações</h2>
        <p>
          Podemos atualizar estes termos conforme o produto evolui. Mudanças relevantes
          serão comunicadas por e-mail ou dentro do próprio produto.
        </p>
      </div>
    </div>
  )
}
