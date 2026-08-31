# ANCAR — Frontend CAG V1

## Escopo desta versão

A tela **Visão Geral** foi convertida para dados reais do backend ANCAR.

- Não existe a opção “Todos os Shoppings”.
- O topo sempre representa um shopping selecionado.
- Apenas os KPIs superiores e o gráfico **Comportamento da CAG** mudam com o shopping.
- Ranking, Visão do Portfólio, Mapa / Distribuição e Oportunidades / Insights permanecem no contexto do portfólio inteiro.
- O frontend não exibe ESG, CO2 evitado, economia, Delta T ou vazão na Visão Geral porque essas fontes ainda não existem na ingestão atual.
- CAGs mistas com chillers de absorção exibem **Intensidade Elétrica (kW/TR)** e não inventam COP global.

## API

Por padrão o frontend consulta:

- `https://n8n.facilities-ai.com.br/webhook/ancar-dashboard-portfolio-v1`
- `https://n8n.facilities-ai.com.br/webhook/ancar-dashboard-shopping-v1?shoppingId=BLD&period=24h`

A base pode ser alterada com:

```env
VITE_ANCAR_API_BASE_URL=https://n8n.facilities-ai.com.br/webhook
```

## Atualização

O frontend atualiza automaticamente a cada **5 minutos**, alinhado ao workflow realtime.
Também existe botão de atualização manual no topo.

## Períodos do gráfico

- 24h
- 7d
- 30d

## Navegação

Nesta etapa o menu principal foi reduzido a:

- Visão Geral
- Shoppings

As demais telas antigas continuam no código para evolução posterior, mas foram retiradas do menu para evitar apresentar indicadores demonstrativos sem fonte real.

## Deploy

O `vite.config.ts` aceita:

- `ancar-shoppings.2see.io`
- `ancar-shoppings.facilities-ai.com.br`
