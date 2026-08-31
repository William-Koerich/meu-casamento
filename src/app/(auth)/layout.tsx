import Link from "next/link"

import { NOME_PRODUTO } from "@/lib/site"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="font-heading mb-10 text-2xl">
        {NOME_PRODUTO}
      </Link>
      <div className="border-border bg-card w-full max-w-sm rounded border p-8">
        {children}
      </div>
    </div>
  )
}
