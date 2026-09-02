# ANCAR Energia Hub — V5.1

## Conceito visual aplicado
A V5.1 implementa o conceito aprovado sobre a base V5.0, preservando coleta resiliente, polling silencioso de 3 minutos e fallback de apresentação por até 10 minutos.

### Visão Geral
- Mantém os 6 KPIs compactos: Potência, Produção, Eficiência CAG, Chillers Ativos, Periféricos e Temperatura Externa.
- Remove o Ranking completo da Home.
- Substitui o antigo espaço do Ranking por:
  - **Desempenho vs Metas**: Meta CAG e Meta Chillers.
  - **Resumo Econômico**: custo energético, custo acima da meta, energia e R$/TRh.
- Mantém Visão do Portfólio 3x2, Mapa, Insights e Qualidade dos Dados.
- Mini-cards do portfólio passam a destacar eficiência, % vs Meta CAG e custo acima da meta.

### Demais telas
- **Shoppings**: cards/tabela com eficiência vs meta e custo acima da meta.
- **Detalhe**: Performance vs Metas, resumo econômico e tabela de chillers com meta/desvio/oportunidade.
- **Ranking**: mantém Eficiência Energética como padrão e acrescenta custo energético, custo acima da meta e R$/TRh.
- **Análises**: acrescenta séries econômicas ao comparador histórico.
- **Alertas**: prioriza qualidade de aquisição, fallback, Meta CAG e Meta Chillers.
- **Energia & Emissões**: passa a concentrar energia, custo total, custo acima da meta, R$/TRh e emissões disponíveis.
- **Relatórios**: prévia e CSV incluem indicadores econômicos e metas.
- **Configurações**: somente Meta CAG, Meta Chillers e Tarifa de Energia ficam editáveis pelo cliente.

## Configuração de negócio
Campos editáveis:
- `targetKwTr` — Meta CAG (kW/TR)
- `targetChillerKwTr` — Meta Chillers (kW/TR)
- `energyTariffBrlMwh` — Tarifa de energia (R$/MWh)

Campos legados permanecem no PostgreSQL apenas para compatibilidade histórica/técnica. O PUT V2 não os sobrescreve quando salva os três parâmetros novos.

## Cálculos
- Tarifa R$/kWh = Tarifa R$/MWh / 1000
- Custo energético = Energia kWh × Tarifa R$/kWh
- Energia de referência da meta = TRh × Meta CAG
- Energia acima da meta = max(0, Energia real − Energia da meta)
- Custo acima da meta = Energia acima da meta × Tarifa
- R$/TRh = Custo energético / TRh
- Tempo na meta = intervalos operacionais válidos com kW/TR <= Meta CAG / intervalos operacionais válidos
- Oportunidade de chiller = max(0, (kW/TR real − Meta Chillers) × TR) × tarifa

Os valores econômicos são estimativas operacionais, não economia garantida.
