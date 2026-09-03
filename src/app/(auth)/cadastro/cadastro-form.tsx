"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { cadastrar } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { cadastroSchema, type CadastroInput } from "@/lib/validators/auth"

const TIPOS_CONTA = [
  {
    valor: "noiva" as const,
    titulo: "Sou noiva",
    descricao: "Vou planejar o meu próprio casamento.",
  },
  {
    valor: "cerimonialista" as const,
    titulo: "Sou cerimonialista",
    descricao: "Vou cadastrar e acompanhar o casamento de vários clientes.",
  },
]

export function CadastroForm({ redirecionarPara }: { redirecionarPara?: string }) {
  const [erro, setErro] = useState<string | null>(null)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: "", email: "", senha: "", tipoConta: "noiva" },
  })

  function onSubmit(dados: CadastroInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await cadastrar(dados, redirecionarPara)
      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }
      if (resultado?.precisaConfirmarEmail) {
        setEmailEnviado(true)
      }
    })
  }

  if (emailEnviado) {
    return (
      <p className="text-muted-foreground text-center text-sm">
        Enviamos um link de confirmação para o seu e-mail. Assim que confirmar, é só
        entrar normalmente.
      </p>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tipoConta"
          render={({ field }) => (
            <FormItem>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {TIPOS_CONTA.map((tipo) => (
                  <Label
                    key={tipo.valor}
                    htmlFor={`tipo-conta-${tipo.valor}`}
                    className={cn(
                      "border-border flex cursor-pointer flex-col gap-1 rounded border p-3 text-sm font-normal",
                      field.value === tipo.valor && "border-primary bg-accent"
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <RadioGroupItem
                        value={tipo.valor}
                        id={`tipo-conta-${tipo.valor}`}
                      />
                      {tipo.titulo}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {tipo.descricao}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {erro && <p className="text-destructive text-sm">{erro}</p>}
        <Button type="submit" className="w-full" disabled={pendente}>
          {pendente ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </Form>
  )
}
