// Cookie que guarda qual casamento é "o atual" pra a sessão — só importa
// pra conta cerimonialista (várias weddings por conta); conta noiva sempre
// resolve pro único casamento que tem, com ou sem cookie (ver
// getMinhaWedding em src/db/queries/weddings.ts).
export const COOKIE_CASAMENTO_ATIVO = "casamento_ativo"

export const OPCOES_COOKIE_CASAMENTO_ATIVO = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
}
