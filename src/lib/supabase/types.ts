// Placeholder até rodar `supabase gen types typescript` contra o projeto real.
// O acesso a dados da aplicação passa pelo Drizzle (src/db); este tipo serve
// apenas para tipar os clientes do @supabase/ssr usados em Auth e Storage.
export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
