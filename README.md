# Calculadora de Preço — Impressão 3D (Bambu Lab)

Calculadora web para precificar peças de impressão 3D e dizer, no rodapé,
**se vale a pena fazer a peça ou não**. Reconstruída a partir do app de
referência (estilo *PrimePrint3D*), calibrada para impressoras **Bambu Lab**
e com valores em **dólar canadense (CAD / C$)**.

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

### Meta de lucro por hora (C$/h) + cenários

Campo livre onde você digita o lucro/hora alvo, com **3 cenários sugeridos**:

| Cenário | Lucro/h | 1 máquina rende/ano | Máquinas p/ C$ 80k |
|---------|---------|---------------------|--------------------|
| Produto comum | C$ 3/h | ~C$ 19.000 | ~4,2 |
| Produto bom | C$ 5/h | ~C$ 31.700 | ~2,5 |
| Premium | C$ 8/h | ~C$ 50.700 | ~1,6 |

Projeção considerando 1 máquina a 24h × 22 dias = 6.336 h/ano, vendendo tudo.
Clicar num cenário preenche o campo; o veredito de cada peça é comparado contra
essa meta.

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
padrão é **C$ 0,15/kWh** (média residencial canadense — varia por província;
veja na sua conta de luz e ajuste).

> **Sobre a X2D:** é uma impressora da X-series com **extrusora dupla**. A
> Bambu Lab não publica em formato acessível a potência média exata, então o
> preset usa **~140 W** — estimativa baseada no consumo típico da X-series
> (~100–150 W em PLA) com um acréscimo pelo segundo bico. Para precisão total,
> meça com um wattímetro de tomada por uma impressão e coloque o número no
> campo "Potência média". O impacto no preço é pequeno: a energia é só uma
> fração do custo (o filamento domina).

## Moeda e valores padrão (Canadá)

Tudo em **dólar canadense (C$)**. Padrões usados:

| Item | Padrão | Observação |
|------|--------|------------|
| Filamento PLA | C$ 25/kg | preço típico no Canadá; PETG C$ 30, ABS C$ 28 |
| Tarifa de energia | C$ 0,15/kWh | média residencial; ajuste pela sua província |
| Meta de lucro/hora | C$ 3,00/h | mínimo por hora de impressora ocupada |
| Margem desejada | 40% | sobre o preço de venda |

Troque qualquer um nas configurações — o app lembra dos seus valores no
navegador.

## Validação da fórmula

A lógica de cálculo foi validada centavo por centavo contra a imagem de
referência (que era em reais): com 258 g, 8 h e margem 40%, ela reproduz
exatamente custo → preço → lucro → margem. A matemática é a mesma; só a moeda
e os preços de insumo mudam para o contexto canadense.

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
