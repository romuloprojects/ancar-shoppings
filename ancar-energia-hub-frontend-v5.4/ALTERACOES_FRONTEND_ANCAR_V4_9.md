# ANCAR Frontend V4.9 — Ranking normalizado pela meta

- Ranking padrão continua em **Eficiência Energética (kW/TR)**.
- Unidades com `targetKwTr` configurado são ordenadas pelo **desvio percentual assinado em relação à meta**: `(kW/TR atual - meta) / meta × 100`, menor primeiro.
- Unidades sem meta entram depois do grupo comparável e são ordenadas por **kW/TR absoluto**, menor primeiro.
- Em empate de desvio percentual, o desempate é pelo menor kW/TR.
- A Visão Geral e a página `/ranking` usam o mesmo critério.
- Unidades sem meta exibem `Sem meta · fallback por kW/TR`.
- O valor principal mostrado continua sendo o kW/TR atual; o texto abaixo informa o desvio em relação à meta.
- Barras da Visão Geral para a métrica de eficiência passam a refletir a posição do ranking, evitando conflito visual com o critério normalizado por meta.
