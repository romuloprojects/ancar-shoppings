# Validação Frontend ANCAR V4.0

## Resultado
- `npm run validate`: PASS
- TS/TSX analisados: 89
- erros sintáticos: 0
- histórico 24h / 7d / 30d: PASS
- validação visual geral: 36 cenários / 0 falhas
- validação geométrica específica da Visão Geral: 6 viewports / PASS

## Viewports geométricas simuladas em Chromium
- 1280×650
- 1280×680
- 1366×768
- 1536×760
- 1902×892
- 1920×1080

A validação mede `getBoundingClientRect()` da faixa inferior, card do mapa, SVG, path real do Brasil, legenda e gauge.

### Exemplo 1902×892
- faixa inferior: 355 px
- card do mapa: ~437,5 × 355 px
- mapa geográfico renderizado: ~317,5 × 274,7 px
- mapa inteiramente contido no SVG/card
- legenda inteiramente contida no card

### Exemplo 1920×1080
- faixa inferior: 405 px
- card do mapa: ~442 × 405 px
- mapa geográfico renderizado: ~373 × 322,8 px

## Limitação
O build completo TanStack/Vite não pôde ser executado neste ambiente porque as dependências npm do projeto não estão instaladas; `npm run build` retorna `vite: not found`. Não foi possível instalar dependências pela rede. A validação realizada usa parsing TypeScript, testes de histórico, o contrato visual existente e Chromium headless para geometria real do mapa/layout.
