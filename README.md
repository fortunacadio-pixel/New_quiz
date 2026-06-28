# Calculadora de Preço — Impressão 3D (Bambu Lab)

Calculadora web para precificar peças de impressão 3D e dizer, no rodapé,
**se vale a pena fazer a peça ou não**. Reconstruída a partir do app de
referência (estilo *PrimePrint3D*) e calibrada para impressoras **Bambu Lab**.

Abra `index.html` no navegador — não precisa de servidor, instalação ou
internet. Todo o cálculo roda localmente em JavaScript, e o app pode ser
instalado no celular (PWA) e usado offline.

## Funcionalidades

- **Veredito de viabilidade no rodapé** (verde / amarelo / vermelho) com base
  no preço de filamento + preço de venda, todos os custos e o tempo de impressão
- **Presets de impressora Bambu Lab** (A1 mini, A1, P1P/P1S, X1/X1-Carbon, H2D)
- **Cadastro de filamentos** (perfis com preço por kg, salvos no navegador)
- **Catálogo de peças** — salvar, abrir e excluir orçamentos
- **Preço de venda manual** para testar quanto sobra num preço fixo
- **Exportar PDF** (impressão) e **instalação como app** (PWA, offline)
- Métricas: preço sugerido, custo total, lucro por unidade/total, margem real,
  lucro por hora e receita total, com composição detalhada do custo

## Como o veredito decide (o que você pediu)

O rodapé mostra um dos três resultados, considerando **filamento + venda +
todos os custos + tempo**:

| Veredito | Condição | Significado |
|----------|----------|-------------|
| ✅ **VIÁVEL** | lucro > 0 **e** lucro/hora ≥ meta | Vale a pena fazer a peça |
| ⚠️ **POUCO VIÁVEL** | lucro > 0 **mas** lucro/hora < meta | Dá lucro, mas a impressora fica ocupada tempo demais para pouco retorno |
| ❌ **INVIÁVEL** | lucro ≤ 0 | O preço de venda não cobre os custos — prejuízo |

A **meta de lucro por hora** (R$/h) é configurável (padrão R$ 5,00/h) e
representa o mínimo que você quer ganhar por hora de impressora ocupada.

## Fórmulas

```
custo_filamento = (gramas / 1000) * preço_por_kg
custo_perda     = custo_filamento * (perda% / 100)
custo_energia   = (potência_W / 1000) * horas * tarifa_kWh
custo_máquina   = depreciação_por_hora * horas
custo_total     = filamento + perda + energia + máquina + mão_de_obra + fixo

preço_sugerido  = custo_total / (1 - margem%) - desconto   # margem sobre a venda
lucro_unidade   = preço_venda - custo_total
margem_real     = lucro_unidade / preço_venda
lucro_por_hora  = lucro_unidade / horas
```

## Calibração Bambu Lab

A **potência média durante a impressão** (não o pico do leito aquecido) é a
chave do custo de energia. Valores aproximados usados nos presets:

| Modelo | Potência média (preset) |
|--------|-------------------------|
| A1 mini | ~90 W |
| A1 | ~95 W |
| P1P / P1S | ~110 W |
| X1 / X1-Carbon | ~120 W |
| **X2D (bico duplo)** | **~140 W (estimado)** — padrão |
| H2D | ~150 W |

Estes são valores médios estimados de impressão em PLA — o leito aquecido dá
picos altos (~1000 W por alguns minutos no aquecimento), mas a média ao longo
do trabalho é bem menor. Se você medir o consumo real da sua máquina (com um
wattímetro de tomada), ajuste no campo "Potência média". A tarifa de energia
padrão é R$ 0,95/kWh — troque pela da sua conta de luz.

> **Sobre a X2D:** é uma impressora da X-series com **extrusora dupla**. A
> Bambu Lab não publica em formato acessível a potência média exata, então o
> preset usa **~140 W** — estimativa baseada no consumo típico da X-series
> (~100–150 W em PLA) com um acréscimo pelo segundo bico. Para precisão total,
> meça com um wattímetro de tomada por uma impressão e coloque o número no
> campo "Potência média". O impacto no preço é pequeno: a energia é só uma
> fração do custo (o filamento domina).

## Validação contra a imagem de referência

Com os dados originais da tela (258 g, 8 h, margem 40%, filamento ~R$115,50/kg
e a configuração de energia da referência), as fórmulas reproduzem os números
**centavo por centavo**: custo R$ 35,56 → preço R$ 59,27 → lucro R$ 23,71 →
margem 40,0%. (Com a Bambu Lab a energia fica mais barata, então o custo total
da mesma peça cai e o lucro sobe.)

## Arquivos

- `index.html` — estrutura e campos
- `style.css` — visual (tema escuro)
- `app.js` — cálculo, veredito, filamentos, catálogo, PDF, PWA
- `manifest.json`, `sw.js`, `icon.svg` — instalação e uso offline

## Conclusão: é viável fazer esta calculadora?

**Sim — é totalmente viável e já está pronta.** São arquivos estáticos, sem
dependências nem servidor: roda no navegador e funciona offline. A matemática é
simples (somas, multiplicações e uma divisão de margem), a lógica foi validada
contra o app de referência, e o veredito de viabilidade por peça — que era o
ponto principal do seu pedido — está funcionando nos três cenários
(viável / pouco viável / inviável).
