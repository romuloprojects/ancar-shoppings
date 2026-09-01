# Validação — ANCAR Frontend V3.5

## npm

Executado no pacote final:

```text
npm run validate
```

Resultado:

```text
TS/TSX analisados: 88
Erros: 0
VALIDAÇÃO DE FONTE: PASS

Páginas/resoluções: 27
Falhas visuais: 0
VALIDAÇÃO VISUAL: PASS
```

A matriz visual continua cobrindo as 9 páginas em:

- 1366×768
- 1440×900
- 1920×1080

## Verificações adicionais V3.5

- Ordenação alfabética por sigla no TopBar: PASS
- 17 localizações mestre cadastradas: PASS
- Marcadores calculados por latitude/longitude: PASS
- Âncoras artificiais por estado removidas: PASS
- `Qualidade dos Dados` com gauge/status separados: PASS
- Favicon ANCAR PNG/ICO válido: PASS
- `vite.config.ts` parseado pelo TypeScript: PASS
- Nenhuma referência textual ao construtor anterior no projeto: PASS
- Host Vite: somente `ancar-shoppings.facilities-ai.com.br`: PASS
