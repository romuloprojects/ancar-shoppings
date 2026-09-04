# Validação — ANCAR Frontend V5.7.2

## Resultado
`npm run validate` executado com sucesso.

### Fonte
- 99 arquivos TS/TSX analisados.
- 0 erros no validador de fonte.

### Regressão funcional
PASS para:
- histórico 24h / 7d / 30d;
- comparativos;
- layout dos 6 KPIs;
- portfólio compacto;
- polling silencioso em 3 minutos;
- resiliência do histórico;
- ranking por meta/fallback;
- saúde de aquisição;
- cálculos econômicos;
- relatórios;
- login.

### Temas
- 40 cenários visuais: 10 telas × 2 temas × 2 viewports.
- 0 falhas.

### NSM / potência x status
- 9/9 verificações específicas PASS.
- NSM presente no fallback geográfico.
- contrato de flags/diagnóstico validado;
- estado de Atenção validado;
- alerta de potência com status OFF validado;
- BAGPS/Periféricos contemplado no alerta;
- cache-bust e versão 5.7.2 validados.

## Build
O pacote-base não contém `node_modules`; o build completo permanece para o ambiente do Easypanel. A suíte de validação offline do projeto passou integralmente.
