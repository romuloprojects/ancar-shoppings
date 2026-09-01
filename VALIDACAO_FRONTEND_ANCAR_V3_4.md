# Validação Frontend ANCAR V3.4

## Objetivo desta revisão

A V3.4 é uma correção visual cirúrgica da **Visão Geral**. A fonte de verdade visual voltou a ser o primeiro frontend entregue pelo cliente, mantendo da V3.3 apenas a integração funcional com dados reais, comparação, configurações e regras de unidade.

Nesta etapa as demais páginas não foram redesenhadas novamente; o objetivo é homologar primeiro a proporção da Visão Geral e só depois propagar o mesmo critério às demais rotas.

## Proporções restauradas a partir do frontend original

- KpiCard: altura-base `116px`.
- Ícone KPI: `48px` / `56px` em telas maiores.
- Valor KPI: `25px` / `28px`.
- ShoppingCard: `min-height: 146px`.
- BrazilMap: `max-height: 286px`.
- Gráfico principal: `272px` / `286px` como altura-base do componente.
- Padding dos painéis principais: `16px`.
- Gaps principais: `16px`.
- Faixa inferior: proporção `5 / 3 / 2 / 2`.
- Portfólio: 6 cards por página, 3 colunas em desktop, com rolagem **interna** se a altura disponível não comportar as duas linhas.
- AppLayout: padding novamente equivalente ao original (`lg:px-6 lg:py-5`).

## Regra de viewport

Em desktop/notebook, a Visão Geral continua tentando ocupar a viewport sem scroll da página. A diferença em relação à V3.3 é que os componentes não são mais reduzidos agressivamente. Quando a altura não comporta todo o conteúdo do Portfólio, a rolagem acontece dentro do painel.

## Comando executado

```bash
npm run validate
```

Resultado:

```text
TS/TSX analisados: 88
Erros: 0
VALIDAÇÃO DE FONTE: PASS

Páginas/resoluções: 27
Falhas visuais: 0
VALIDAÇÃO VISUAL: PASS
```

A validação visual usa Chromium headless e cobre as 9 rotas nas resoluções 1920x1080, 1440x900 e 1366x768.

## Limitação conhecida

O `npm run build` completo ainda depende do conjunto real de dependências do projeto (`node_modules`). O ambiente de execução não possui acesso ao registry npm, portanto a compilação Vite final continua sendo confirmada no Easypanel. O comando de validação local usa TypeScript instalado no ambiente + Chromium/Playwright para inspeção visual.
