# Validação Frontend ANCAR V3.6

## Resultado consolidado

- `npm run validate`: **PASS**
- TypeScript/TSX analisados: **89 arquivos**
- Erros sintáticos: **0**
- Imports locais `@/`: verificados pelo validador; nenhum alvo ausente
- Validação específica de histórico: **PASS**
- Períodos funcionais cobertos pela camada comum: **24h / 7d / 30d**
- Rotas temporais revisadas: **5**
- Matriz lógica de gráficos: **5 rotas × 3 períodos = 15 combinações**
- Validação visual: **9 páginas × 4 resoluções = 36 combinações**
- Falhas de overflow/layout no contrato visual: **0**

## Resoluções da validação visual

- 1920 × 1080
- 1791 × 857 — adicionada por ser equivalente ao screenshot usado na revisão da V3.5
- 1440 × 900
- 1366 × 768

## Atualização silenciosa

Validado no código:

- `REFRESH_INTERVAL_MS = 3 * 60 * 1000`;
- atualização por `tick` React, sem `window.location.reload`;
- `visibilitychange` força nova verificação quando a aba volta ao primeiro plano e o intervalo já venceu;
- telas de Shoppings, Alertas, Ranking, Análises e Energia preservam o último dado válido durante polling periódico;
- Visão Geral preserva portfólio/histórico anterior em falhas transitórias;
- Configurações não recarrega o formulário editável por `tick`;
- TopBar usa `selectedShopping.lastUpdate`, proveniente de `latest.collectedAt`;
- texto padrão: `🟢 Última atualização HH:mm`.

## Histórico e gráficos

O workflow `ANCAR_10_API_FRONTEND_V2_DADOS_REAIS.json` foi inspecionado offline. A API já faz:

- `24h`: 24 horas / bucket de 5 min;
- `7d`: 168 horas / bucket de 30 min;
- `30d`: 720 horas / bucket de 120 min;
- `json_agg(... ORDER BY bucket_ts)`.

Portanto a V3.6 não altera os cálculos do n8n. O frontend agora adiciona proteção de apresentação:

1. ordena timestamps;
2. remove timestamps inválidos;
3. deduplica timestamps;
4. usa eixo X temporal (`type=number`, `scale=time`);
5. fixa o domínio no período solicitado;
6. insere separador nulo quando há lacuna maior que 2,5 buckets;
7. usa interpolação linear;
8. não conecta lacunas;
9. usa rótulo por período;
10. mantém tooltip com data/hora completa.

As cinco rotas verificadas são:

- `/` — Visão Geral;
- `/shoppings/$shoppingId` — Detalhe;
- `/analises` — Análises;
- `/esg` — Energia e Emissões;
- `/relatorios` — Relatórios.

Detalhe, Análises e Relatórios passaram a usar o mesmo `historyPeriod` global do TopBar. Visão Geral e ESG já utilizavam esse estado.

## Ajuste visual da faixa inferior

- faixa inferior da Visão Geral aumentada em notebooks/desktops baixos;
- mapa com limite maior de altura;
- gauge de Qualidade dos Dados reduzido;
- número central reduzido para evitar competição visual/sobreposição;
- contrato visual atualizado com a resolução 1791×857;
- 36/36 cenários sem overflow de viewport no validador visual.

## Build Vite

O comando `npm run build` foi tentado e não pôde ser concluído neste ambiente porque o ZIP não contém `node_modules` e o executável local `vite` não está instalado:

`sh: 1: vite: not found`

Isso não representa erro de sintaxe da V3.6. O build final deve ser confirmado no Easypanel, onde as dependências são instaladas pelo ambiente real do projeto.

## Teste da API ao vivo

A tentativa de consultar o hostname do n8n a partir deste ambiente não pôde ser concluída por indisponibilidade de resolução DNS externa. Por isso a validação da API foi feita sobre o workflow 10 preservado e seus contratos, não sobre uma chamada HTTP ao ambiente de produção.

## Status

**V3.6 aprovada nas validações offline de fonte, histórico e layout.**

Próxima confirmação recomendada: build/deploy no Easypanel e smoke test visual dos três períodos com dados reais.
