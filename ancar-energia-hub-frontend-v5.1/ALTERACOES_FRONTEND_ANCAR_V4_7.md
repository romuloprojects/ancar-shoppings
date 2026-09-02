# ANCAR Frontend V4.7

## Alteração solicitada

- O card **Ranking dos Shoppings** da Visão Geral passa a iniciar sempre em **Eficiência Energética (kW/TR)**.
- O rótulo anterior **Intensidade elétrica (kW/TR)** foi substituído por **Eficiência Energética (kW/TR)** no Ranking da Visão Geral.
- A página dedicada de Ranking também passa a exibir **Eficiência Energética** para a métrica interna `intensidade`.

## Comportamento preservado

- A chave interna e o cálculo continuam inalterados.
- O ranking de kW/TR continua com `lowerIsBetter=true`: menor kW/TR aparece primeiro.
- Nenhuma alteração no Workflow 10 V3, coleta, banco ou contrato da API.
- Polling silencioso de 3 minutos e demais correções V4.6 preservados.

## Validação

`npm run validate`: PASS

- 90 TS/TSX, 0 erros
- histórico 24h/7d/30d: PASS
- comparativos: PASS
- 6 KPIs: PASS
- Portfólio 3x2: PASS
- atualização silenciosa: PASS
- validação visual: 36 cenários, 0 falhas
