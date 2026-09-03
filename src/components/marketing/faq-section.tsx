import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { NOME_PRODUTO } from "@/lib/site"

const PERGUNTAS = [
  {
    pergunta: "Preciso pagar?",
    resposta:
      "Se você é noiva, sim: um pagamento único, sem mensalidade, que já libera o app inteiro. Se você é cerimonialista, é uma assinatura mensal — o plano define quantos casamentos você administra ao mesmo tempo.",
  },
  {
    pergunta: "Funciona no celular?",
    resposta: `Sim. O ${NOME_PRODUTO} foi pensado primeiro para o celular — a maioria das noivas organiza o casamento no dia a dia, entre uma tarefa e outra.`,
  },
  {
    pergunta: "Posso compartilhar com meu noivo?",
    resposta:
      "Sim. Você convida o noivo, madrinhas, padrinhos, familiares e a cerimonialista, cada um com uma permissão diferente (ver tudo, editar ou só ler).",
  },
  {
    pergunta: "Sou cerimonialista, serve?",
    resposta:
      "Serve, de duas formas: uma noiva pode te convidar pra colaborar no casamento dela, ou você pode criar sua própria conta cerimonialista e cadastrar o casamento de vários clientes diferentes — veja os planos Básico, Premium e Platinum em Preços.",
  },
  {
    pergunta: "Meus dados ficam salvos?",
    resposta:
      "Sim, tudo fica salvo no seu casamento, protegido por login. Você pode excluir sua conta e seus dados a qualquer momento em Configurações.",
  },
  {
    pergunta: "Consigo exportar?",
    resposta:
      "Sim. Dá para exportar o planejamento completo em PDF e cada módulo (convidados, orçamento, fornecedores, checklist) em CSV.",
  },
]

export function FaqSection() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h2 className="font-heading text-center text-3xl">Perguntas frequentes</h2>
      <Accordion type="single" collapsible className="mt-8">
        {PERGUNTAS.map((item) => (
          <AccordionItem key={item.pergunta} value={item.pergunta}>
            <AccordionTrigger>{item.pergunta}</AccordionTrigger>
            <AccordionContent>{item.resposta}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
