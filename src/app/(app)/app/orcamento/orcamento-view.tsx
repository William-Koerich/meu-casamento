import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CategoriaComItens, PagamentoComItem } from "@/db/queries/budget"
import type { vendors as vendorsTable } from "@/db/schema"

import { CategoryList } from "./category-list"
import { PaymentsTab } from "./payments-tab"

type OrcamentoViewProps = {
  categorias: CategoriaComItens[]
  vendors: (typeof vendorsTable.$inferSelect)[]
  pagamentos: PagamentoComItem[]
}

export function OrcamentoView({ categorias, vendors, pagamentos }: OrcamentoViewProps) {
  return (
    <Tabs defaultValue="categorias">
      <TabsList>
        <TabsTrigger value="categorias">Categorias</TabsTrigger>
        <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
      </TabsList>
      <TabsContent value="categorias" className="pt-4">
        <CategoryList categorias={categorias} vendors={vendors} />
      </TabsContent>
      <TabsContent value="pagamentos" className="pt-4">
        <PaymentsTab
          pagamentos={pagamentos}
          itens={categorias.flatMap((categoria) =>
            categoria.items.map((item) => ({ id: item.id, descricao: item.descricao }))
          )}
        />
      </TabsContent>
    </Tabs>
  )
}
