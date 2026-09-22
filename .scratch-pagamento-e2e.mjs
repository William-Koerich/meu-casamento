import puppeteer from "puppeteer-core"

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const BASE = "http://localhost:3001"

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()
page.setDefaultNavigationTimeout(60000)
page.setDefaultTimeout(60000)
page.on("pageerror", (err) => console.log("  [pageerror]", err.message))
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("  [console.error]", msg.text().slice(0, 300))
})

async function clicarBotaoPorTexto(pagina, texto, seletor = "button") {
  const botoes = await pagina.$$(seletor)
  for (const botao of botoes) {
    const t = await pagina.evaluate((el) => el.textContent?.trim(), botao)
    if (t === texto) {
      await botao.click()
      return true
    }
  }
  return false
}

await page.goto(`${BASE}/entrar`, { waitUntil: "networkidle0" })
await page.type('input[name="email"]', "mariana@exemplo.com")
await page.type('input[name="senha"]', "SenhaDemo123!")
await page.click('button[type="submit"]')
await page.waitForFunction(() => !location.pathname.startsWith("/entrar"))
console.log("login ok")

await page.goto(`${BASE}/app/orcamento`, { waitUntil: "networkidle0" })

const abas = await page.$$('[role="tab"]')
for (const aba of abas) {
  const texto = await page.evaluate((el) => el.textContent, aba)
  if (texto?.trim() === "Pagamentos") {
    await aba.click()
    break
  }
}
await new Promise((r) => setTimeout(r, 500))

const primeiraLinha = await page.$("table tbody tr")
if (!primeiraLinha) throw new Error("nenhum pagamento encontrado na conta de demo")

const descricaoOriginal = await page.evaluate(
  (tr) => tr.querySelectorAll("td")[1]?.textContent?.trim(),
  primeiraLinha
)
console.log("pagamento existente:", descricaoOriginal)

// --- Editar ---
const botaoEditar = await primeiraLinha.$('button[aria-label^="Editar pagamento"]')
if (!botaoEditar) throw new Error("botão Editar não encontrado")
await botaoEditar.click()
await new Promise((r) => setTimeout(r, 400))

const inputDescricao = await page.$('input[placeholder="Ex.: Sinal, 2ª parcela..."]')
const valorPreenchido = await page.evaluate((el) => el.value, inputDescricao)
console.log("dialog abriu pré-preenchido?", valorPreenchido === descricaoOriginal)

const descricaoEditada = `${descricaoOriginal}-editado`
await inputDescricao.click({ clickCount: 3 })
await inputDescricao.type(descricaoEditada)
await clicarBotaoPorTexto(page, "Salvar")
await page.waitForFunction(
  (texto) => document.querySelector("table")?.textContent?.includes(texto),
  {},
  descricaoEditada
)
console.log("descrição atualizada na tabela? true")

// acha a linha editada (a ordem da tabela pode mudar entre requisições)
async function linhaComTexto(pagina, texto) {
  const linhas = await pagina.$$("table tbody tr")
  for (const linha of linhas) {
    const t = await pagina.evaluate((el) => el.textContent, linha)
    if (t?.includes(texto)) return linha
  }
  return null
}

// restaura o valor original
const linhaEditada = await linhaComTexto(page, descricaoEditada)
const botaoEditar2 = await linhaEditada.$('button[aria-label^="Editar pagamento"]')
await botaoEditar2.click()
await new Promise((r) => setTimeout(r, 400))
const inputDescricao2 = await page.$('input[placeholder="Ex.: Sinal, 2ª parcela..."]')
await inputDescricao2.click({ clickCount: 3 })
await inputDescricao2.type(descricaoOriginal)
await clicarBotaoPorTexto(page, "Salvar")
await page.waitForFunction(
  (texto) => !document.querySelector("table")?.textContent?.includes(texto),
  {},
  descricaoEditada
)
console.log("descrição restaurada ao original? true")

// --- Excluir (só confirma o diálogo, cancela sem excluir de verdade) ---
const linhaOriginal = await linhaComTexto(page, descricaoOriginal)
const botaoExcluir = await linhaOriginal.$('button[aria-label^="Excluir pagamento"]')
await botaoExcluir.click()
await new Promise((r) => setTimeout(r, 300))
const textoDialogo = await page.evaluate(
  () => document.querySelector('[role="alertdialog"]')?.textContent ?? ""
)
console.log(
  "diálogo de exclusão menciona a descrição?",
  textoDialogo.includes(descricaoOriginal)
)
await clicarBotaoPorTexto(page, "Cancelar")
await new Promise((r) => setTimeout(r, 300))

const totalLinhasFinal = await page.$$eval("table tbody tr", (trs) => trs.length)
console.log("linhas na tabela depois de cancelar exclusão:", totalLinhasFinal)

await browser.close()
