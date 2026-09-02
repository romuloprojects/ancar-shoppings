# Implantação — ANCAR V5.1

## Arquitetura final
- 00 V5 — setup PostgreSQL / energia e metas — executar uma vez e manter INATIVO.
- 00A V12 — cadastro multi-shopping / ciclo 3 min — **sem alteração nesta entrega**; permanece a versão vigente.
- 01 V6.2 — realtime WebCTRL bulk + retries 3 min + snapshot energia/metas — ATIVO.
- 10 V6 — API frontend economia/metas + fallback 10 min — ATIVO.
- 11 V2 — API Configurações energia/metas — ATIVO.
- Frontend V5.1.

## Ordem recomendada
1. Fazer backup/export das versões atualmente ativas.
2. Importar `ANCAR_00_SETUP_POSTGRES_V5_ENERGIA_METAS.json`, associar `ancar-postgres` e executar uma vez. Confirmar `ok=true`. Manter inativo.
3. Importar `ANCAR_11_API_CONFIGURACOES_V2_ENERGIA_METAS.json`, associar PostgreSQL/Redis. Desativar o 11 V1 antes de ativar o V2, pois o path é o mesmo.
4. Importar `ANCAR_01_REALTIME_WEBCTRL_GENERICO_V6_2_HTTP_BULK_RETRY_3MIN_ENERGIA_METAS.json`. Reassociar PostgreSQL/Redis se necessário. Executar manualmente e validar os 8 shoppings / 99 pontos. Desativar o V6.1 antes de ativar o V6.2.
5. Importar `ANCAR_10_API_FRONTEND_V6_ECONOMIA_METAS_FALLBACK_10MIN.json`. Desativar o 10 V5 antes de ativar o V6, pois os webhooks são os mesmos.
6. Publicar `ancar-energia-hub-frontend-v5.1.zip`.
7. Abrir Configurações e preencher, por shopping, somente: Meta CAG, Meta Chillers e Tarifa de Energia.

## Checks de homologação
- TopBar mantém polling silencioso de 3 min.
- Home: 6 KPIs + gráfico + Desempenho vs Metas + Resumo Econômico.
- Home: Ranking completo não aparece; continua disponível em `/ranking`.
- Portfólio: 6 cards por página em 3x2, sem scroll interno.
- Configurações: somente os 3 campos de negócio aparecem.
- Após salvar configuração, GET settings retorna os 3 valores atualizados.
- Chillers: meta/desvio/oportunidade aparecem quando kW e TR estão disponíveis.
- Economia: não configurada quando tarifa/meta estiverem vazias; nunca assumir zero.
- Fallback de último valor válido permanece limitado a 10 min e não altera a série histórica.
