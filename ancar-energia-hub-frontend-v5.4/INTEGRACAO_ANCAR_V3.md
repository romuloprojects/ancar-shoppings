# Frontend ANCAR V3 — integração real

## Fonte de dados

O frontend não contém dados operacionais mockados. As telas usam as APIs n8n:

- Portfólio: `GET /webhook/ancar-dashboard-portfolio-v1`
- Shopping/histórico: `GET /webhook/ancar-dashboard-shopping-v1`
- Configurações: `GET/PUT /webhook/ancar-settings-v1`

Base configurada em `.env.example`:

`VITE_ANCAR_API_BASE_URL=https://n8n.facilities-ai.com.br/webhook`

Atualização automática: 5 minutos.

## Unidades padronizadas

- Potência elétrica: kW
- Energia elétrica: kWh
- Produção térmica: TR
- Frio acumulado: TRh
- Indicador elétrico: kW/TR
- Temperatura: °C
- Fator de emissão: kgCO₂/kWh
- Emissões evitadas estimadas: kgCO₂

MW e MWh não são usados no frontend.

## Telas

- Visão Geral: top KPIs e gráfico do shopping selecionado; ranking, portfólio, mapa e insights permanecem de portfólio.
- Shoppings: lista/grid com potência, energia, kW/TR, produção e cobertura reais.
- Detalhe: comportamento, equipamentos, qualidade e configuração do shopping.
- Ranking: métricas comparáveis derivadas dos dados reais.
- Análises: histórico 24h / 7d / 30d.
- ESG: adaptada para “Energia e Emissões”, sem score ESG inventado.
- Alertas: condições atuais derivadas dos limites configurados por shopping.
- Relatórios: resumo operacional real e exportação CSV; preparada para relatórios programados futuros.
- Configurações: baseline, meta, fator de emissão e limites por shopping; botão Salvar persiste via n8n.

Campos sem fonte atual (vazão, Delta T, aproximação, água, resíduos etc.) não são exibidos.
