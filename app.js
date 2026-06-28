// Calculadora de precificação para impressão 3D
// Lógica reconstruída a partir do app de referência (PrimePrint3D).

const $ = (id) => document.getElementById(id);

const inputs = [
  "precoKg", "potencia", "tarifa", "maquinaHora", "maoObra", "fixoExtra",
  "filamento", "tempo", "quantidade", "perda", "margem", "desconto",
];

const brl = (v) =>
  "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const num = (id) => parseFloat($(id).value) || 0;

function calcular() {
  // --- entradas ---
  const precoKg = num("precoKg");
  const potenciaW = num("potencia");
  const tarifa = num("tarifa");
  const maquinaHora = num("maquinaHora");
  const maoObra = num("maoObra");
  const fixoExtra = num("fixoExtra");

  const filamentoG = num("filamento");
  const tempoH = num("tempo");
  const qtd = Math.max(1, num("quantidade"));
  const perdaP = num("perda");
  const margemP = num("margem");
  const desconto = num("desconto");

  $("margemLabel").textContent = margemP;

  // --- custos por unidade ---
  const custoFilamento = (filamentoG / 1000) * precoKg;
  const custoPerda = custoFilamento * (perdaP / 100);
  const custoEnergia = (potenciaW / 1000) * tempoH * tarifa;
  const custoMaquina = maquinaHora * tempoH;

  const custoTotal =
    custoFilamento + custoPerda + custoEnergia + custoMaquina + maoObra + fixoExtra;

  // --- preço e lucro ---
  // Preço = custo / (1 - margem)  → margem sobre o preço de venda (markup por margem)
  const margem = Math.min(margemP, 99.9) / 100;
  let precoUnid = custoTotal / (1 - margem) - desconto;
  if (precoUnid < 0) precoUnid = 0;

  const lucroUnid = precoUnid - custoTotal;
  const lucroTotal = lucroUnid * qtd;
  const receitaTotal = precoUnid * qtd;
  const margemReal = precoUnid > 0 ? (lucroUnid / precoUnid) * 100 : 0;
  const lucroHora = tempoH > 0 ? lucroTotal / (tempoH * qtd) : 0;

  // --- saída ---
  $("precoUnid").textContent = brl(precoUnid);
  $("custoTotal").textContent = brl(custoTotal);
  $("lucroUnid").textContent = brl(lucroUnid);
  $("lucroTotal").textContent = brl(lucroTotal);
  $("margemReal").textContent = margemReal.toFixed(1) + "%";
  $("lucroHora").textContent = brl(lucroHora);
  $("receitaTotal").textContent = brl(receitaTotal);

  // breakdown
  $("bdFilG").textContent = filamentoG;
  $("bdFil").textContent = brl(custoFilamento);
  $("bdPerdaP").textContent = perdaP;
  $("bdPerda").textContent = brl(custoPerda);
  $("bdEnergiaH").textContent = tempoH;
  $("bdEnergia").textContent = brl(custoEnergia);
  $("bdMaquina").textContent = brl(custoMaquina);
  $("bdMao").textContent = brl(maoObra);
  $("bdFixo").textContent = brl(fixoExtra);

  // cor do lucro conforme sinal
  const cor = lucroUnid >= 0 ? "var(--verde)" : "#f87171";
  $("lucroUnid").style.color = cor;
}

inputs.forEach((id) => {
  $(id).addEventListener("input", calcular);
});

calcular();
