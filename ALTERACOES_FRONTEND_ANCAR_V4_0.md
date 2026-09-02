# ANCAR Frontend V4.0 — correção definitiva da faixa inferior / mapa

## Problema identificado
A resolução física do monitor (ex.: 1920×1080) não é necessariamente a viewport CSS do navegador. Escala do Windows e chrome do navegador podem reduzir a altura útil para a faixa de 650–720 CSS px. As regras anteriores da V3.9 começavam em `min-height: 720px`, portanto em alguns ambientes o frontend caía nas regras antigas e mantinha a faixa inferior pequena.

## Correções
- Layout compacto da Visão Geral agora é calibrado desde 650 CSS px de altura útil.
- Faixas específicas: 650–719, 720–819, 820–899 e >=900 px.
- Prioridade maior para os 4 cards inferiores, reduzindo proporcionalmente a faixa de gráfico/ranking quando a altura é limitada.
- Mapa continua em `preserveAspectRatio="xMidYMid meet"`, sem distorção geográfica.
- Legenda do mapa passou a uma faixa horizontal compacta de 22 px com overflow horizontal local quando necessário.
- Padding e margem do card de mapa foram reduzidos para maximizar área útil do SVG.
- O mapa permanece integralmente dentro do card e ocupa uma parcela maior da área disponível.

## Alturas alvo da faixa inferior
- 650–719 CSS px: 275 px
- 720–819 CSS px: 305 px
- 820–899 CSS px: 355 px
- >=900 CSS px: 405 px

## Qualidade dos Dados
O gauge compacto da V3.9 foi preservado: 56 px e valor central de 11 px (reduções adicionais permanecem nas regras de baixa altura existentes).
