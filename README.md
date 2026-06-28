# Calculadora de Preço — Impressão 3D

Calculadora web para precificação de peças de impressão 3D, reconstruída a partir
do app de referência mostrado na imagem (estilo *PrimePrint3D*).

Abra o arquivo `index.html` em qualquer navegador — não precisa de servidor,
instalação ou internet. Todo o cálculo roda localmente em JavaScript.

## Funcionalidades

- **Dados da peça:** filamento usado (g), tempo de impressão (h), quantidade e perda/refugo (%)
- **Margem desejada:** slider de 5% a 90% + desconto por unidade
- **Configurações de custo:** preço do filamento (R$/kg), potência da impressora (W),
  tarifa de energia (R$/kWh), depreciação da máquina (R$/h), mão de obra e custo fixo extra
- **Resultado:** preço sugerido, custo total, lucro por unidade, lucro total,
  margem real, lucro por hora e receita total
- **Composição do custo** detalhada (filamento, perda, energia, máquina, mão de obra, fixo)

## Fórmulas usadas

```
custo_filamento = (gramas / 1000) * preço_por_kg
custo_perda     = custo_filamento * (perda% / 100)
custo_energia   = (potência_W / 1000) * horas * tarifa_kWh
custo_máquina   = depreciação_por_hora * horas
custo_total     = filamento + perda + energia + máquina + mão_de_obra + fixo

preço_unidade   = custo_total / (1 - margem%) - desconto   # margem sobre o preço de venda
lucro_unidade   = preço_unidade - custo_total
margem_real     = lucro_unidade / preço_unidade
```

### Validação contra a imagem de referência

Usando os mesmos dados da tela (258 g, 8 h, margem 40%, filamento ~R$115,50/kg,
800 W, tarifa R$0,90/kWh), a calculadora reproduz **exatamente** os números originais:

| Campo            | Imagem    | Calculadora |
|------------------|-----------|-------------|
| Energia (8h)     | R$ 5,76   | R$ 5,76     |
| Custo total      | R$ 35,56  | R$ 35,56    |
| Preço sugerido   | R$ 59,27  | R$ 59,27    |
| Lucro por unidade| R$ 23,71  | R$ 23,71    |
| Margem real      | 40,0%     | 40,0%       |

## Arquivos

- `index.html` — estrutura e campos
- `style.css` — visual (tema escuro, parecido com o app original)
- `app.js` — toda a lógica de cálculo

## Conclusão: é viável fazer?

**Sim — é totalmente viável, e na verdade é um projeto simples.** Esta versão
funcional foi feita com apenas três arquivos estáticos (HTML/CSS/JS), sem
nenhuma dependência, banco de dados ou backend.

Motivos:

- **Matemática trivial:** são apenas multiplicações, somas e uma divisão de margem.
  Não há nada pesado computacionalmente.
- **Sem infraestrutura:** roda 100% no navegador. Pode ser hospedada de graça
  (GitHub Pages, Netlify) ou aberta direto do arquivo.
- **Fórmula confirmada:** os números do app original foram reproduzidos com
  precisão de centavos, então a lógica está correta.

Possíveis evoluções (opcionais, se quiser transformar em produto):

- Salvar/carregar peças e um catálogo (usar `localStorage` ou backend)
- Exportar orçamento em PDF
- Cadastro de vários filamentos com preços diferentes
- Empacotar como app (PWA ou app de loja) para uso offline no celular

Para o uso pretendido — calcular preço de peças 3D — a calculadora já está
**pronta e correta**.
