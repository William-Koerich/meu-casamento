// Service worker mínimo, escrito à mão (sem Workbox/next-pwa) — o app é um
// SaaS de dado dinâmico protegido por RLS, então "funcionar 100% offline"
// não faz sentido pra quase nenhuma tela (checklist, orçamento, convidados
// etc. sempre precisam da rede). O objetivo aqui é só o necessário pra virar
// um PWA de verdade: existir um service worker com um handler de "fetch"
// (exigido pelo Chrome/Android pra considerar o app instalável) e mostrar
// uma tela própria de "você está offline" em vez do erro genérico do
// navegador quando uma navegação falha sem internet.
const CACHE = "organiza-meu-casamento-v1"
const PAGINA_OFFLINE = "/offline"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(PAGINA_OFFLINE))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((chave) => chave !== CACHE).map((chave) => caches.delete(chave)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  // Só navegação (carregar uma página) cai pro fallback offline — pedidos
  // de API/dados continuam passando direto pra rede, sem cache, porque
  // dado de casamento nunca deveria vir de um cache desatualizado.
  if (event.request.mode !== "navigate") return

  event.respondWith(
    fetch(event.request).catch(() => caches.match(PAGINA_OFFLINE))
  )
})
