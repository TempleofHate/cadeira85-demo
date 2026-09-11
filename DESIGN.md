---
name: "Cadeira85"
description: "Uma agenda mais simples. Um dia mais leve."
colors:
  paper: "#f4f2e9"
  surface: "#fffef9"
  ink: "#233c34"
  muted: "#59675d"
  green: "#173e35"
  green-hover: "#265448"
  soft-green: "#e2eade"
  line: "#d4d8cc"
  lime: "#dceba5"
  rust: "#8e472a"
  warning-bg: "#f8e9cd"
  danger: "#a13030"
  danger-bg: "#fbe9e5"
  white: "#fffef9"
  warning-ink: "#794610"
  completed-bg: "#eaece5"
  completed-ink: "#4b594d"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(2.75rem,4.7vw,4.5rem)"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-.03em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-.03em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: ".8125rem"
    fontWeight: 750
    lineHeight: 1.6
  small:
    fontFamily: "Manrope, sans-serif"
    fontSize: ".75rem"
    lineHeight: 1.6
rounded:
  radius: "14px"
  small-radius: "8px"
  badge: "5px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "48px"
  space-8: "64px"
  space-9: "96px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.small-radius}"
    padding: "13px 21px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.small-radius}"
    padding: "13px 21px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.white}"
    rounded: "{rounded.small-radius}"
    padding: "13px 21px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small-radius}"
    padding: "12px 14px"
  navigation:
    textColor: "{colors.ink}"
  badge-confirmed:
    backgroundColor: "{colors.soft-green}"
    textColor: "{colors.green}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  booking-sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.radius}"
    padding: "28px"
  choice:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small-radius}"
    padding: "20px"
---

# Design System: Cadeira85

## Overview

**Creative North Star: "A agenda aberta"**

Cadeira85 combina papel quente, tinta verde profunda e Manrope para uma experiência premium, moderna, prática, elegante e acolhedora. A agenda é o principal elemento visual: horários, clientes e pagamentos dão identidade ao produto.

O espaço permite ler e decidir com calma; linhas e superfícies organizam a operação. A marca do software permanece distinta da Barbearia Horizonte, estabelecimento fictício da demonstração. A direção vem do briefing e da implementação, sem comp visual externo.

**Key Characteristics:**

- Papel quente e verde profundo.
- Tipografia local, hierarquia clara e números tabulares.
- Reservas em etapas; agenda em linhas responsivas.
- Estados com texto, foco visível e movimento discreto.

## Colors

Verde profundo sobre papel quente sustenta a identidade. Os valores normativos estão no frontmatter; os nomes preservam os custom properties existentes.

Exceção local preservada na revisão: `#d5e2d7` em `.preview-heading p` é texto auxiliar sobre verde profundo, com matiz da superfície. Não representa outra cor de marca nem exige um token compartilhado para uma única aplicação.

### Primary

`green` é a tinta de ação e seleção; `green-hover` é seu hover. `soft-green` acolhe confirmações e escolhas selecionadas. `lime` acentua a área comercial e disponibilidade na prévia.

### Neutral

`paper` cobre a página; `surface` e `white` têm intencionalmente o mesmo valor e servem a fichas e texto invertido. `ink` é texto principal, `muted` é apoio e `line` divide conteúdo.

### Semantic

`rust` marca o foco. `warning-bg` com `warning-ink` indica pendência; `danger` e `danger-bg` identificam erros e cancelamentos. `completed-bg` e `completed-ink` identificam concluído e pagamento no local. Esses três últimos tokens de status foram extraídos de valores literais de CSS, sem inventar novas variáveis na aplicação.

## Typography

Manrope é uma fonte variável local (`assets/fonts/manrope.ttf`, pesos 200–800, `font-display: swap`) com fallback sans-serif. Não há fonte de display separada. A hierarquia é contextual, sem razão modular única.

Display usa o clamp normativo no desktop, 3.25rem até 1000px e `clamp(2.5rem,8.9vw,3.5rem)` até 760px. Títulos compartilham entrelinha 1.16 e tracking -.03em. Texto base tem 16px e entrelinha 1.6; rótulos usam .8125rem, auxiliares .75rem. Parágrafos limitam-se a 70ch; a introdução da landing a 45ch (44ch no celular). Horários e métricas usam números tabulares.

## Layout

Container de `min(1200px,calc(100% - 64px))`, centralizado; até 760px usa `calc(100% - 40px)`. A escala de espaçamento exposta no frontmatter vai de 4px a 96px. Valores contextuais como 20px, 28px e 40px coexistem no CSS e não devem ser arredondados automaticamente.

A landing tem colunas 1.1fr / 1fr e intervalo de 64px, ampliado a 88px a partir de 1500px. Até 760px vira uma coluna; apenas uma reserva da prévia permanece visível. A ficha de reserva limita-se a 1040px, com resumo de 300px (250px até 1000px). No celular o resumo passa para cima, sem posição sticky, e o fluxo ocupa toda a largura.

O painel usa agenda fluida e lateral de 240px, virando uma coluna até 1000px. Métricas passam de quatro para duas colunas até 760px. Reservas são linhas com hora, descrição, valor e ações: no celular valores e ações passam abaixo da descrição. Horários selecionáveis passam de quatro para três colunas no celular; datas mantêm quatro.

## Elevation & Depth

A profundidade vem principalmente de papel, superfícies claras e divisórias de 1px. A única sombra compartilhada é `0 18px 50px #173e3515`, aplicada à prévia de agenda, toast e diálogo. Fichas operacionais usam bordas, sem sombra adicional. O backdrop do diálogo é `#132c26a6`.

## Shapes

Superfícies maiores usam raio de 14px; botões, campos e escolhas usam 8px. Badges usam 5px. Avatares e indicadores de seleção são circulares. A marca usa o desenho vetorial de cadeira já presente no cabeçalho; não adicionar iconografia ornamental.

## Components

- **Botões:** altura mínima de 50px, padding 13px 21px, peso 750 e tamanho .875rem. O CTA da landing sobe para 56px. Primário verde, secundário transparente com borda, destrutivo vermelho. Disabled usa `line` e `muted`. Active desloca 1px para baixo.
- **Campos:** rótulo permanente, mínimo de 50px, padding 12px 14px, borda `line`, fundo `surface`; erro usa borda `danger` e mensagem. Placeholder não substitui rótulo.
- **Navegação:** marca de peso 800 com sufixo 85 de peso 500, links de 44px mínimos; barra de 94px reduzida a 76px no celular.
- **Badges:** estado por texto e fundo semântico, tamanho .75rem, peso 700, padding 4px 8px. Permanecem compactos e quebram em conjunto dentro da linha de reserva.
- **Ficha e escolhas:** ficha de 14px com padding 28px; escolhas de 8px com mínimo de 90px (84px no celular). Seleção combina `aria-pressed`, fundo verde suave e indicador circular marcado.
- **Progresso e resumo:** segmentos de 4px mostram etapas; contagem e título explicam a etapa atual. O resumo usa detalhes expansíveis; o total aparece após selecionar o serviço e a decomposição dos valores na etapa de pagamento.
- **Agenda do proprietário:** linhas com divisórias, números tabulares, badges e ações explícitas. Cancelamento acrescenta texto riscado; operações destrutivas passam pelo diálogo.

Foco global: outline de 3px em `rust`, offset 4px. Botões e escolhas transitam em .18s com `cubic-bezier(.16,1,.3,1)`. Movimento reduzido remove essas transições e o deslocamento active. Os snippets no sidecar são amostras visuais isoladas; o comportamento de reserva depende do JavaScript da aplicação.

Extração documental estática de `styles.css`, `index.html`, `agendar.html` e `painel.html`, contextualizada por `PRODUCT.md` e `.impeccable/surfaces/index-html.md`. Esta extração não constitui verificação de estilos computados ou teste de navegador; evidências de revisão pertencem a `.impeccable/review/`.

## Do's and Don'ts

### Do:

- Do reutilizar os tokens de styles.css e os raios de 8px e 14px.
- Do manter rótulos em português brasileiro e identificar pagamentos simulados.
- Do conservar foco de 3px, alvos confortáveis e estados descritos em texto.
- Do adaptar a agenda a linhas no celular e manter preços e horários legíveis.

### Don't:

- Don't usar preto e dourado, clichês de barbearia ou aparência de template SaaS.
- Don't transformar cada informação em um cartão elevado.
- Don't usar apenas cor para distinguir pagamento, cancelamento ou seleção.
- Don't apresentar clientes fictícios como prova social real.
