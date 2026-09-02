# Ancar Energia Hub — Etapa 6

## Base utilizada

- `ancar-energia-hub-etapa5(1).zip`

## Escopo concluído

A Etapa 6 padroniza as páginas internas do protótipo visual, mantendo o tema dark/premium, as rotas existentes, os dados demonstrativos e a camada `dashboardService`.

### Páginas revisadas

- Shoppings
- Detalhe do shopping
- Ranking
- Análises
- ESG
- Alertas
- Relatórios
- Configurações

### Padronização visual

- cabeçalhos e hierarquia visual consistentes;
- cards-resumo por página;
- painéis de seção reutilizáveis;
- barras de filtros padronizadas;
- tabelas com melhor leitura e rolagem horizontal em telas menores;
- estados de carregamento e estados vazios;
- responsividade para desktop, tablet e celular;
- manutenção do tema corporativo escuro da Etapa 5.

### Arquitetura de dados

- páginas de dados continuam consumindo `dashboardService`;
- `TopBar` e `Configurações` deixaram de importar a lista mock diretamente;
- `BrazilMap` recebe a lista de shoppings por propriedade, sem dependência direta da base mock.

## Ajuste adicional do mapa

O componente `src/components/BrazilMap.tsx` foi corrigido para manter os marcadores dentro do contorno do Brasil e melhorar a leitura das concentrações regionais.

- RJ: 6 pontos
- SP: 4 pontos
- CE: 4 pontos
- RN: 1 ponto
- MT: 1 ponto
- RO: 1 ponto

Foram usadas âncoras visuais internas por estado e deslocamentos específicos para os agrupamentos de RJ, SP e CE. Todos os 17 pontos foram verificados matematicamente como internos ao polígono do mapa.

## Validações executadas

- `npm run format` — concluído
- `npm run lint` — 0 erros; 7 avisos de Fast Refresh, sendo 6 preexistentes em componentes de UI e 1 no novo arquivo compartilhado
- `npm run build` — concluído com sucesso para client, SSR e Nitro
- smoke test HTTP das rotas — todas retornaram HTTP 200:
  - `/`
  - `/shoppings`
  - `/shoppings/ban`
  - `/ranking`
  - `/analises`
  - `/esg`
  - `/alertas`
  - `/relatorios`
  - `/configuracoes`

## Arquivos principais criados ou alterados

- `src/components/InternalPage.tsx`
- `src/components/ui-helpers.tsx`
- `src/components/BrazilMap.tsx`
- `src/components/TopBar.tsx`
- `src/routes/shoppings.tsx`
- `src/routes/shoppings.$shoppingId.tsx`
- `src/routes/ranking.tsx`
- `src/routes/analises.tsx`
- `src/routes/esg.tsx`
- `src/routes/alertas.tsx`
- `src/routes/relatorios.tsx`
- `src/routes/configuracoes.tsx`
- `src/styles.css`

O arquivo `vite.config.ts` foi preservado sem alterações.
