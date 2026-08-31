// Reexporta as referências oficiais do Supabase (schema `auth`, roles do
// Postgres e o helper `authUid` = `(select auth.uid())`) fornecidas pelo
// próprio Drizzle, em vez de declará-las à mão.
export {
  anonRole,
  authenticatedRole,
  authUid,
  authUsers,
  serviceRole,
} from "drizzle-orm/supabase"
