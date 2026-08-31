import type { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DESCRICAO_PRODUTO, NOME_PRODUTO } from "@/lib/site"

import "./globals.css"

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const fontSerif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: NOME_PRODUTO,
  description: DESCRICAO_PRODUTO,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} ${fontSerif.variable} antialiased`}
    >
      <body className="bg-background text-foreground min-h-screen">
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  )
}
