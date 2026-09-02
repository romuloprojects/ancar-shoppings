# Validação ANCAR V5.1

Data: 02/09/2026

## Frontend
Comando executado:

`npm run validate`

Resultado: **PASS**.

- 91 arquivos TS/TSX analisados, 0 erros de transpile/sintaxe.
- Histórico 24h / 7d / 30d: PASS.
- Comparativos temporais: PASS.
- 6 KPIs: 8 viewports, sem overflow.
- Portfólio 3x2: 9 viewports, 6 shoppings por página e sem scroll interno.
- Atualização silenciosa: PASS.
- Resiliência de histórico: 12/12 PASS.
- Ranking por meta + fallback por kW/TR: PASS.
- Saúde da aquisição/fallback: 10/10 PASS.
- Conceito econômico: 12/12 PASS.
- Validação visual de contrato: 36 cenários, 0 falhas.

`npm run build` também foi tentado. O ambiente de geração não possui `node_modules` e não tem acesso funcional ao registry npm, portanto o Vite não está instalado localmente e o comando termina com `vite: not found`. O build real deve ser confirmado no pipeline/Easypanel, onde as dependências são instaladas.

## Workflows
Validador executado: `validate_workflows_v51.mjs`.

Resultado: **42 PASS / 0 falhas**.

Cobertura:
- JSON dos 4 workflows alterados.
- Sintaxe JavaScript de todos os Code nodes.
- Persistência versionada das 3 configurações.
- Preservação dos campos legados quando omitidos.
- Coleta 3 min, bulk HTTP nativo e retries seletivos.
- Indicadores econômicos CAG/chillers.
- Fallback de apresentação por 10 minutos.
- Endpoints existentes preservados.
- GET/PUT de Configurações limitado aos 3 campos do cliente.
- Fórmulas sintéticas de custo, custo acima da meta e R$/TRh.

## Observação
Não foi executada conexão real contra PostgreSQL/WebCTRL a partir deste ambiente. A homologação final deve verificar os workflows com credenciais de produção, começando por execução manual e conferência do payload antes da ativação.
