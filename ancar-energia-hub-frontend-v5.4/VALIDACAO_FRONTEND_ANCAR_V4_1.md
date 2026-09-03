# Validação Frontend ANCAR V4.1

## Alteração testada

A faixa inferior passa a ser dimensionada pela `Visão do Portfólio`, com 6 cards visíveis em duas linhas. Os três painéis laterais devem ter exatamente a mesma altura do Portfólio.

## Validações executadas

- `npm run validate:source`: PASS — 89 arquivos TS/TSX, 0 erros sintáticos.
- `npm run validate:history`: PASS — 24h / 7d / 30d, ordenação, deduplicação, lacunas e domínio temporal.
- `python scripts/validate-lower-row.py`: PASS.

### Matriz da faixa inferior em Chromium

Testada em:

- 1280×680
- 1366×768
- 1536×760
- 1792×860
- 1902×892
- 1920×1080

Para todas as resoluções o validador confirma:

1. os 6 ShoppingCards estão inteiramente dentro do painel;
2. `Visão do Portfólio` não possui scroll vertical;
3. os quatro painéis inferiores possuem a mesma altura;
4. o mapa fica inteiro dentro do SVG;
5. a legenda fica dentro do card do mapa;
6. a faixa inferior não ultrapassa a viewport do dashboard.

## Referência estrutural

A correção foi feita após comparação direta com `ancar-energia-hub-main(1).zip`, o primeiro frontend enviado pelo cliente. O original não aplicava `height: 100%` em cada ShoppingCard da grade do Portfólio; esse comportamento foi reintroduzido na V4.1.

## Limitação

O build Vite/TanStack completo não pode ser executado neste ambiente porque as dependências npm do projeto não estão disponíveis integralmente no cache offline. A validação cobre parsing TypeScript/TSX, regras funcionais já existentes e geometria da faixa inferior em Chromium.
