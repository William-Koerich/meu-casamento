"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function GoogleButton({
  redirecionarPara = "/app",
}: {
  redirecionarPara?: string
}) {
  const [carregando, setCarregando] = useState(false)

  async function entrarComGoogle() {
    setCarregando(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirecionarPara)}`,
      },
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={carregando}
      onClick={entrarComGoogle}
    >
      Continuar com Google
    </Button>
  )
}
