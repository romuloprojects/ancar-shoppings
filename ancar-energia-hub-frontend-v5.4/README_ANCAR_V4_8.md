# Implantação ANCAR V4.8 + Workflow 10 V4

## Ordem recomendada

1. Importe `ANCAR_10_API_FRONTEND_V4_RESILIENCIA_HISTORICO.json` no n8n.
2. Reassocie a credencial PostgreSQL `ancar-postgres`, se o n8n solicitar.
3. Desative o Workflow 10 V3 antes de ativar o V4, pois os paths de webhook são os mesmos.
4. Ative o Workflow 10 V4.
5. Publique `ancar-energia-hub-frontend-v4.8.zip` no Easypanel.
6. Confirme no navegador a meta `ancar-ui-version = 4.8.0`.

## Webhooks preservados
- `GET /webhook/ancar-dashboard-portfolio-v1`
- `GET /webhook/ancar-dashboard-shopping-v1?shoppingId=...&period=24h|7d|30d`

## Diagnóstico novo no payload do shopping

```json
{
  "historyDiagnostics": {
    "historyCount": 288,
    "historyFrom": "...",
    "historyTo": "...",
    "latestCollectedAt": "...",
    "latestInsideRequestedWindow": true,
    "historyInconsistent": false
  }
}
```

Se `historyInconsistent=true`, o frontend V4.8 nunca apaga uma série válida que já esteja em memória.

## Comportamento esperado
- atualização automática a cada 3 minutos;
- nenhuma piscada/reload;
- histórico válido permanece na tela durante falha ou resposta vazia transitória;
- somente uma primeira carga realmente sem telemetria pode exibir ausência de dados.
