# Validação Frontend ANCAR V4.9

## Resultado

- TypeScript/TSX: **90 arquivos / 0 erros**
- Histórico 24h / 7d / 30d: **PASS**
- Comparativos: **PASS**
- Layout 6 KPIs: **PASS**
- Portfólio 3x2: **PASS**
- Atualização silenciosa: **PASS**
- Resiliência de histórico: **12 PASS / 0 FAIL**
- Ranking normalizado por meta: **10 PASS / 0 FAIL**
- Validação visual: **36 cenários / 0 falhas**

## Critério do Ranking de Eficiência Energética

1. Unidades com `targetKwTr` configurado são ordenadas pelo desvio percentual assinado:
   `(kW/TR atual - targetKwTr) / targetKwTr * 100`.
2. Menor desvio é melhor: valores mais negativos (mais abaixo da meta) aparecem primeiro; valores positivos (acima da meta) aparecem depois.
3. Em empate de desvio, desempate pelo menor kW/TR absoluto.
4. Unidades sem meta ficam após as unidades com meta e são ordenadas pelo menor kW/TR absoluto.
5. Unidades sem dado válido permanecem sem posição.

## Teste sintético

Entrada:
- B: 0,90 kW/TR, 10% abaixo da meta
- A: 0,70 kW/TR, 2% abaixo da meta
- D: 0,80 kW/TR, 5% acima da meta
- C: 0,60 kW/TR, sem meta
- E: 0,75 kW/TR, sem meta

Ordem validada: **B, A, D, C, E**.
