"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerFieldProps = {
  value?: string
  onChange: (valor: string) => void
  placeholder?: string
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Selecione uma data",
}: DatePickerFieldProps) {
  const selecionada = value ? new Date(`${value}T00:00:00`) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !selecionada && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {selecionada
            ? format(selecionada, "dd/MM/yyyy", { locale: ptBR })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selecionada}
          onSelect={(data) => data && onChange(format(data, "yyyy-MM-dd"))}
          locale={ptBR}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
