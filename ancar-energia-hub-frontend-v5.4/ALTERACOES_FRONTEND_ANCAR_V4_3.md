# ANCAR Frontend V4.3 — correção definitiva da faixa inferior

## Causa raiz encontrada

A V4.2 aplicava a correção estrutural somente em `min-width: 1280px`, porém o layout desktop histórico da ANCAR já é ativado em `min-width: 1024px`.

Na faixa 1024–1279 px CSS continuavam ativas regras antigas:

- `.overview-portfolio-cards { overflow: hidden; }`
- `.overview-portfolio-cards > a { min-height: 0; height: 100%; }`
- compactação adicional em `max-height: 800px`

Isso explica a tela real: quatro painéis inferiores lado a lado, mas apenas uma linha do Portfólio, scrollbar interno e mapa/Qualidade comprimidos.

Também foi identificado que `.app-inset` continuava com `height: 100svh` e `overflow: hidden`, impedindo a página de crescer quando o Portfólio precisava de duas linhas completas.

## Correção V4.3

- Regra definitiva inicia em `min-width: 1024px` e `min-height: 650px`.
- `app-inset` passa a permitir `overflow-y: auto` mantendo TopBar sticky.
- Dashboard passa a ter terceira track `auto`.
- Portfólio exibe sempre 6 itens por página em grid 3 x 2.
- Cada ShoppingCard preserva 146 px e a tipografia/métricas existentes.
- Portfólio não possui scroll interno nem clipping.
- A altura natural do Portfólio governa a faixa inferior.
- Mapa, Insights e Qualidade usam stretch e ficam exatamente com a mesma altura.
- Mapa usa o espaço vertical ampliado e preserva proporção geográfica.
- Qualidade usa gauge 76 px com número central 11 px.
- Adicionado `data-ancar-ui-version="4.3"` na Visão Geral para confirmar a versão implantada pelo inspetor do navegador.

## Regra de produto final

`Visão do Portfólio -> determina altura da linha`

`Mapa / Insights / Qualidade -> acompanham a mesma altura`

Se o conjunto ultrapassar a viewport, a área principal da página rola verticalmente. O Portfólio não é comprimido.
