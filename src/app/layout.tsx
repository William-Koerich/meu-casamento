import type { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DESCRICAO_PRODUTO, getUrlBase, NOME_PRODUTO } from "@/lib/site"
import { SCRIPT_TEMA_INICIAL } from "@/lib/theme"

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
  metadataBase: new URL(getUrlBase()),
  title: { default: NOME_PRODUTO, template: `%s — ${NOME_PRODUTO}` },
  description: DESCRICAO_PRODUTO,
  openGraph: {
    title: NOME_PRODUTO,
    description: DESCRICAO_PRODUTO,
    locale: "pt_BR",
    type: "website",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} ${fontSerif.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Roda antes do primeiro paint pra evitar flash do tema errado. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body className="bg-background text-foreground min-h-screen">
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster position="top-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
