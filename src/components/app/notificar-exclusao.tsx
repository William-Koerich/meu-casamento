"use client"

import { toast } from "sonner"

type ResultadoDesfazer = { erro: string } | { erro?: undefined }

/**
 * Toast com botão "Desfazer" depois de uma exclusão — mesma confirmação
 * (`AlertDialog`) de sempre continua existindo em cada tela; isso é uma 2ª
 * rede de segurança por ~8s depois do clique (ver decisão "Lixeira/desfazer
 * em exclusões" no CLAUDE.md). `linha` é o registro devolvido pela Server
 * Action de exclusão (`excluirComRetorno`); `restaurar` é a Server Action
 * de restauração correspondente daquele módulo.
 */
export function notificarExclusao<T>({
  linha,
  mensagem,
  restaurar,
}: {
  linha: T
  mensagem: string
  restaurar: (linha: T) => Promise<ResultadoDesfazer>
}) {
  toast(mensagem, {
    duration: 8000,
    action: {
      label: "Desfazer",
      onClick: () => {
        restaurar(linha).then((resultado) => {
          if (resultado?.erro) toast.error(resultado.erro)
          else toast.success("Restaurado.")
        })
      },
    },
  })
}
