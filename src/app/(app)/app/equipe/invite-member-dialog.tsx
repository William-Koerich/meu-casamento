"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { convidarMembro } from "@/actions/members"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAPEL_MEMBRO_LABELS, PERMISSAO_LABELS } from "@/lib/labels"
import { getUrlBase } from "@/lib/site"
import { convidarMembroSchema, type ConvidarMembroInput } from "@/lib/validators/members"

export function InviteMemberDialog() {
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [linkConvite, setLinkConvite] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  const form = useForm<ConvidarMembroInput>({
    resolver: zodResolver(convidarMembroSchema),
    defaultValues: { email: "", papel: "familiar", permissao: "editor" },
  })

  function fechar(aberto: boolean) {
    setAberto(aberto)
    if (!aberto) {
      setLinkConvite(null)
      setCopiado(false)
      setErro(null)
      form.reset()
    }
  }

  function onSubmit(dados: ConvidarMembroInput) {
    setErro(null)
    iniciarTransicao(async () => {
      const resultado = await convidarMembro(dados)
      if (resultado.erro) {
        setErro(resultado.erro)
        return
      }
      setLinkConvite(`${getUrlBase()}/convite/${resultado.conviteToken}`)
    })
  }

  async function copiarLink() {
    if (!linkConvite) return
    await navigator.clipboard.writeText(linkConvite)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogTrigger asChild>
        <Button>Convidar</Button>
      </DialogTrigger>
      <DialogContent>
        {linkConvite ? (
          <>
            <DialogHeader>
              <DialogTitle>Convite criado</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Não enviamos e-mail — copie o link abaixo e mande pra pessoa (WhatsApp,
                e-mail etc). Ao abrir o link, ela cria a própria conta e já entra
                colaborando neste casamento.
              </p>
              <div className="border-border bg-muted rounded border p-2 text-xs break-all">
                {linkConvite}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={copiarLink}>
                {copiado ? "Link copiado!" : "Copiar link"}
              </Button>
              <Button onClick={() => fechar(false)}>Concluir</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Convidar para a equipe</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="papel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PAPEL_MEMBRO_LABELS).map(
                              ([valor, rotulo]) => (
                                <SelectItem key={valor} value={valor}>
                                  {rotulo}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permissao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permissão</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PERMISSAO_LABELS).map(([valor, rotulo]) => (
                              <SelectItem key={valor} value={valor}>
                                {rotulo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {erro && <p className="text-destructive text-sm">{erro}</p>}
                <DialogFooter>
                  <Button type="submit" disabled={pendente}>
                    {pendente ? "Enviando..." : "Convidar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
