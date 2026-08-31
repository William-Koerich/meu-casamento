"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { formatCurrency } from "@/lib/format"

type OrcamentoDonutProps = {
  dados: { nome: string; valor: number; cor: string }[]
}

export function OrcamentoDonut({ dados }: OrcamentoDonutProps) {
  const comValor = dados.filter((item) => item.valor > 0)

  if (comValor.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        Nenhum valor previsto cadastrado ainda.
      </p>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={comValor}
            dataKey="valor"
            nameKey="nome"
            innerRadius={64}
            outerRadius={96}
            paddingAngle={2}
            strokeWidth={0}
          >
            {comValor.map((entrada) => (
              <Cell key={entrada.nome} fill={entrada.cor} />
            ))}
          </Pie>
          <Tooltip formatter={(valor) => formatCurrency(Number(valor))} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
        {comValor.map((entrada) => (
          <div key={entrada.nome} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entrada.cor }}
            />
            <span className="text-muted-foreground">{entrada.nome}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
