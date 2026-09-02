# Validação — ANCAR Frontend V3.1

Data: 2026-09-01

## Escopo

A V3.1 é uma revisão do Frontend V3, preservando sua identidade visual e integração existente com as APIs n8n. O escopo desta versão foi:

- responsividade global;
- funcionamento real do comando **Comparar**;
- contexto de comparação compartilhado com **Análises**;
- ranking de **Intensidade elétrica (kW/TR)** sem excluir silenciosamente CAGs mistas;
- opção separada de **Eficiência elétrica comparável (kW/TR)**;
- exibição explícita de unidades sem dado, desatualizadas ou não comparáveis;
- padronização visual de todo kW/TR em exatamente duas casas decimais;
- manutenção das unidades kW, kWh, TR, TRh, °C, kgCO₂/kWh e kgCO₂;
- eliminação de dependência de códigos fixos de shopping no frontend.

## Arquivos alterados em relação à V3

Foram alterados 22 arquivos existentes e nenhum arquivo funcional da V3 foi removido:

- `src/components/AppSidebar.tsx`
- `src/components/InternalPage.tsx`
- `src/components/ShoppingCard.tsx`
- `src/components/TopBar.tsx`
- `src/contexts/DashboardRuntimeProvider.tsx`
- `src/contexts/dashboard-runtime-context.ts`
- `src/layouts/AppLayout.tsx`
- `src/routes/alertas.tsx`
- `src/routes/analises.tsx`
- `src/routes/configuracoes.tsx`
- `src/routes/esg.tsx`
- `src/routes/index.tsx`
- `src/routes/ranking.tsx`
- `src/routes/relatorios.tsx`
- `src/routes/shoppings.$shoppingId.tsx`
- `src/routes/shoppings.tsx`
- `src/services/dashboardService.ts`
- `src/services/liveDashboardService.ts`
- `src/styles.css`
- `src/types/index.ts`
- `src/types/live.ts`
- `src/utils/format.ts`

## Validações executadas

### TypeScript / TSX

- 89 arquivos TS/TSX/config analisados.
- 0 erros de parsing/sintaxe.
- 193 imports locais/alias (`./`, `../`, `@/`) verificados.
- 0 imports locais ausentes.

### Dados e integração

- Nenhuma referência ativa a mocks (`USE_MOCK`, `data/mock`, `mockData`, `mockShoppings`).
- Nenhum código de shopping BLD/BAN/BPS/CVS/GOL hardcoded no `src`.
- Seletor, comparação, ranking e páginas consomem dinamicamente o portfólio retornado pela API.
- A V3.1 não exige alteração adicional nos workflows n8n 10/11.

### Ranking

- **Intensidade elétrica** utiliza kW/TR disponível e permite CAGs elétricas ou mistas quando potência CAG + produção térmica são válidas.
- **Eficiência elétrica comparável** mantém a restrição técnica para CAGs comparáveis.
- Shopping sem valor não é removido da lista: recebe `—` e motivo.
- Estados previstos: `Sem dado disponível`, `Dados desatualizados`, `Não comparável nesta métrica`.
- Ranking da Visão Geral não usa mais corte fixo `.slice(0,8)`.

### Comparar

- O botão **Comparar** abre seletor de unidades e métrica.
- Exige no mínimo duas unidades.
- Mantém período atual.
- Persiste unidades + métrica no contexto/localStorage.
- Navega para `/analises`, que utiliza a seleção para carregar as séries históricas correspondentes.

### kW/TR

Foi criado o formatador central `formatKwTr()` com:

- `minimumFractionDigits: 2`
- `maximumFractionDigits: 2`

Casos executados diretamente contra o utilitário:

- `0.7` → `0,70` — PASS
- `0.6925` → `0,69` — PASS
- `1` → `1,00` — PASS
- `null` → `—` — PASS

Não foram encontrados padrões restantes de arredondamento visual para 3 casas em kW/TR.

### Unidades

Busca estática no `src`:

- referências a `MW`: 0
- referências a `MWh`: 0
- host antigo `2see.io`: 0

Host Vite mantido como:

`ancar-shoppings.facilities-ai.com.br`

### Responsividade

Foram revisados TopBar, página inicial, grids de KPI, ranking, cards, filtros, gráficos, tabelas, tabs e formulários para breakpoints mobile/tablet/notebook/desktop.

Principais ajustes:

- controles de shopping/período/comparação permanecem acessíveis abaixo de `xl` por painel lateral;
- tabelas usam contêiner com scroll horizontal interno controlado;
- conteúdo global usa `min-width: 0` e evita overflow da página;
- cards passam por layouts de 1/2/3/4/5/6 colunas conforme página e breakpoint;
- gráficos usam `ResponsiveContainer` e alturas progressivas;
- filtros deixam de depender de largura fixa em mobile;
- tabs podem rolar horizontalmente em telas pequenas;
- ranking possui composição específica para mobile e desktop.

Matriz-alvo da revisão:

- 360×800
- 390×844
- 768×1024
- 1024×768
- 1366×768
- 1440×900
- 1920×1080
- 1920×1200
- 2560×1440

## Limitação da validação neste ambiente

O build completo `vite build` não pôde ser executado porque este ambiente não consegue resolver `registry.npmjs.org` e não possui `node_modules` do projeto. A tentativa de acesso ao registry retornou erro de DNS (`Could not resolve host`).

Por isso, a validação realizada aqui foi estrutural/offline: parser TypeScript/TSX, resolução de imports locais, inspeções estáticas, testes do formatador e auditoria das rotas/componentes alterados.

O build do Easypanel continua sendo a confirmação final de compilação com todas as dependências instaladas e renderização em navegador real.

## Resultado

- Sintaxe/parsing: **PASS**
- Imports locais: **PASS**
- Mock ativo: **PASS (0 encontrado)**
- MW/MWh: **PASS (0 encontrado)**
- Host antigo: **PASS (0 encontrado)**
- Hardcode dos shoppings atuais: **PASS (0 encontrado)**
- kW/TR com 2 casas: **PASS**
- Estrutura de comparação: **PASS**
- Ranking sem exclusão silenciosa: **PASS**
- Responsividade: **PASS em auditoria estrutural; build/render final pendente do Easypanel**
