import type { TarefaComResponsavel } from "@/db/queries/tasks"

export function rotuloMeses(mesesAntes: number | null): string {
  if (mesesAntes === null) return "Sem prazo definido"
  if (mesesAntes === 0) return "1 semana antes"
  if (mesesAntes === 1) return "1 mês antes"
  return `${mesesAntes} meses antes`
}

export function agruparPorMeses(tarefas: TarefaComResponsavel[]) {
  const grupos = new Map<number | null, TarefaComResponsavel[]>()
  for (const tarefa of tarefas) {
    const chave = tarefa.mesesAntes
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave)!.push(tarefa)
  }

  return [...grupos.entries()]
    .sort(([a], [b]) => {
      if (a === null) return 1
      if (b === null) return -1
      return b - a
    })
    .map(([mesesAntes, itens]) => ({
      mesesAntes,
      rotulo: rotuloMeses(mesesAntes),
      itens,
    }))
}
