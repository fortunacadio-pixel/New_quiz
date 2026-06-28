// Calculadora de precificação para impressão 3D — Bambu Lab
// Lógica de custo reconstruída do app de referência + veredito de viabilidade.

const $ = (id) => document.getElementById(id);

const FIELDS = [
  "potencia", "tarifa", "maquinaHora", "maoObra", "fixoExtra", "metaHora",
  "precoKg", "filamento", "tempo", "quantidade", "perda", "margem",
  "desconto", "precoManual",
];

const LS_FIL = "calc3d_filaments_cad";
const LS_PECAS = "calc3d_pecas_cad";
const LS_STATE = "calc3d_state_cad";

// Moeda em dólar canadense (CAD)
const money = (v) =>
  "C$ " + v.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (id) => parseFloat($(id).value) || 0;
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid = () => Math.random().toString(36).slice(2, 9);

// ---------------------------------------------------------------- cálculo ----
function calcular() {
  const precoKg = num("precoKg");
  const potenciaW = num("potencia");
  const tarifa = num("tarifa");
  const maquinaHora = num("maquinaHora");
  const maoObra = num("maoObra");
  const fixoExtra = num("fixoExtra");
  const metaHora = num("metaHora");

  const filamentoG = num("filamento");
  const tempoH = num("tempo");
  const qtd = Math.max(1, num("quantidade"));
  const perdaP = num("perda");
  const margemP = num("margem");
  const desconto = num("desconto");
  const precoManual = parseFloat($("precoManual").value);

  $("margemLabel").textContent = margemP;

  // custos por unidade
  const custoFilamento = (filamentoG / 1000) * precoKg;
  const custoPerda = custoFilamento * (perdaP / 100);
  const custoEnergia = (potenciaW / 1000) * tempoH * tarifa;
  const custoMaquina = maquinaHora * tempoH;
  const custoTotal =
    custoFilamento + custoPerda + custoEnergia + custoMaquina + maoObra + fixoExtra;

  // preço: manual se preenchido, senão sugerido pela margem
  const margem = Math.min(margemP, 99.9) / 100;
  const precoSugerido = Math.max(0, custoTotal / (1 - margem) - desconto);
  const usandoManual = !isNaN(precoManual) && precoManual > 0;
  const precoUnid = usandoManual ? precoManual : precoSugerido;

  const lucroUnid = precoUnid - custoTotal;
  const lucroTotal = lucroUnid * qtd;
  const receitaTotal = precoUnid * qtd;
  const margemReal = precoUnid > 0 ? (lucroUnid / precoUnid) * 100 : 0;
  const lucroHora = tempoH > 0 ? lucroUnid / tempoH : 0;

  // saída
  $("precoUnid").textContent = money(precoUnid);
  document.querySelector(".preco-label").textContent =
    usandoManual ? "Preço de venda (manual)" : "Preço sugerido por unidade";
  $("custoTotal").textContent = money(custoTotal);
  $("lucroUnid").textContent = money(lucroUnid);
  $("lucroTotal").textContent = money(lucroTotal);
  $("margemReal").textContent = margemReal.toFixed(1) + "%";
  $("lucroHora").textContent = money(lucroHora);
  $("receitaTotal").textContent = money(receitaTotal);
  $("lucroUnid").style.color = lucroUnid >= 0 ? "var(--verde)" : "var(--vermelho)";
  $("margemReal").style.color = margemReal >= 0 ? "var(--verde)" : "var(--vermelho)";

  $("bdFilG").textContent = filamentoG;
  $("bdFil").textContent = money(custoFilamento);
  $("bdPerdaP").textContent = perdaP;
  $("bdPerda").textContent = money(custoPerda);
  $("bdEnergiaH").textContent = tempoH;
  $("bdEnergia").textContent = money(custoEnergia);
  $("bdMaquina").textContent = money(custoMaquina);
  $("bdMao").textContent = money(maoObra);
  $("bdFixo").textContent = money(fixoExtra);

  veredito({ lucroUnid, lucroHora, metaHora, margemReal });
  persistirEstado();
}

// ------------------------------------------------------------- veredito ------
function veredito({ lucroUnid, lucroHora, metaHora, margemReal }) {
  const el = $("veredito"), tag = $("vdTag"), msg = $("vdMsg");
  el.classList.remove("ok", "warn", "bad");

  if (lucroUnid <= 0) {
    el.classList.add("bad");
    tag.textContent = "❌ INVIÁVEL";
    msg.textContent =
      `Nesse preço você teria prejuízo de ${money(Math.abs(lucroUnid))} por peça. ` +
      `O preço de venda não cobre o filamento + energia + custos. Aumente o preço ou reduza o custo.`;
  } else if (lucroHora < metaHora) {
    el.classList.add("warn");
    tag.textContent = "⚠️ POUCO VIÁVEL";
    msg.textContent =
      `Dá lucro de ${money(lucroUnid)} por peça, mas rende só ${money(lucroHora)}/h — ` +
      `abaixo da sua meta de ${money(metaHora)}/h. A impressora fica muito tempo ocupada para pouco retorno.`;
  } else {
    el.classList.add("ok");
    tag.textContent = "✅ VIÁVEL";
    msg.textContent =
      `Vale a pena fazer: lucro de ${money(lucroUnid)} por peça (${margemReal.toFixed(0)}% de margem) ` +
      `e ${money(lucroHora)}/h de impressão, acima da sua meta de ${money(metaHora)}/h.`;
  }
}

// ------------------------------------------------------- estado / persistir --
function persistirEstado() {
  const st = {};
  FIELDS.forEach((f) => (st[f] = $(f).value));
  st.printer = $("printer").value;
  save(LS_STATE, st);
}
function restaurarEstado() {
  const st = load(LS_STATE, null);
  if (!st) return;
  FIELDS.forEach((f) => { if (st[f] !== undefined) $(f).value = st[f]; });
  if (st.printer) $("printer").value = st.printer;
}

// ----------------------------------------------------------- filamentos ------
function filamentosDefault() {
  return [
    { id: uid(), nome: "PLA padrão", precoKg: 25 },
    { id: uid(), nome: "PETG", precoKg: 30 },
    { id: uid(), nome: "ABS", precoKg: 28 },
  ];
}
function renderFilamentos(selId) {
  const fils = load(LS_FIL, null) || (save(LS_FIL, filamentosDefault()), load(LS_FIL, []));
  const sel = $("filamentoPerfil");
  sel.innerHTML = "";
  fils.forEach((f) => {
    const o = document.createElement("option");
    o.value = f.id;
    o.textContent = `${f.nome} — ${money(f.precoKg)}/kg`;
    sel.appendChild(o);
  });
  if (selId) sel.value = selId;
  const atual = fils.find((f) => f.id === sel.value);
  if (atual) $("precoKg").value = atual.precoKg;
}
function novoFilamento() {
  const nome = prompt("Nome do filamento:");
  if (!nome) return;
  const preco = parseFloat((prompt("Preço por kg (C$):", "25") || "").replace(",", "."));
  if (!preco || preco <= 0) return;
  const fils = load(LS_FIL, []);
  const novo = { id: uid(), nome, precoKg: preco };
  fils.push(novo);
  save(LS_FIL, fils);
  renderFilamentos(novo.id);
  calcular();
}
function excluirFilamento() {
  const id = $("filamentoPerfil").value;
  let fils = load(LS_FIL, []);
  if (fils.length <= 1) return alert("Mantenha ao menos um filamento.");
  fils = fils.filter((f) => f.id !== id);
  save(LS_FIL, fils);
  renderFilamentos(fils[0].id);
  calcular();
}

// ------------------------------------------------------------- catálogo ------
function snapshot() {
  const st = {};
  FIELDS.forEach((f) => (st[f] = $(f).value));
  return st;
}
function salvarPeca() {
  const nome = prompt("Nome da peça:");
  if (!nome) return;
  const pecas = load(LS_PECAS, []);
  pecas.push({ id: uid(), nome, data: snapshot(), preco: $("precoUnid").textContent });
  save(LS_PECAS, pecas);
  renderCatalogo();
}
function renderCatalogo() {
  const pecas = load(LS_PECAS, []);
  const card = $("catalogoCard"), ul = $("catalogo");
  card.hidden = pecas.length === 0;
  ul.innerHTML = "";
  pecas.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML =
      `<div class="cat-info"><div class="cat-nome"></div><div class="cat-sub"></div></div>` +
      `<div class="cat-actions"><button data-act="load">Abrir</button><button data-act="del">Excluir</button></div>`;
    li.querySelector(".cat-nome").textContent = p.nome;
    li.querySelector(".cat-sub").textContent =
      `${p.data.filamento}g · ${p.data.tempo}h · ${p.preco}`;
    li.querySelector('[data-act="load"]').onclick = () => carregarPeca(p.id);
    li.querySelector('[data-act="del"]').onclick = () => excluirPeca(p.id);
    ul.appendChild(li);
  });
}
function carregarPeca(id) {
  const p = load(LS_PECAS, []).find((x) => x.id === id);
  if (!p) return;
  FIELDS.forEach((f) => { if (p.data[f] !== undefined) $(f).value = p.data[f]; });
  calcular();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function excluirPeca(id) {
  save(LS_PECAS, load(LS_PECAS, []).filter((x) => x.id !== id));
  renderCatalogo();
}

// --------------------------------------------------------------- eventos -----
$("printer").addEventListener("change", (e) => {
  const v = e.target.value;
  $("printerNome").textContent = e.target.selectedOptions[0].text.split(/\s+[—(]/)[0].trim();
  if (v !== "custom") { $("potencia").value = v; calcular(); }
});
$("filamentoPerfil").addEventListener("change", () => { renderFilamentos($("filamentoPerfil").value); calcular(); });
$("novoFilamento").addEventListener("click", novoFilamento);
$("excluirFilamento").addEventListener("click", excluirFilamento);
$("salvarPeca").addEventListener("click", salvarPeca);
$("exportarPdf").addEventListener("click", () => window.print());
FIELDS.forEach((id) => $(id).addEventListener("input", calcular));

// ----------------------------------------------------------------- init ------
restaurarEstado();
renderFilamentos($("filamentoPerfil").value);
renderCatalogo();
$("printerNome").textContent = $("printer").selectedOptions[0].text.split(/\s+[—(]/)[0].trim();
calcular();

// PWA (só registra em http/https; em file:// é ignorado)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
