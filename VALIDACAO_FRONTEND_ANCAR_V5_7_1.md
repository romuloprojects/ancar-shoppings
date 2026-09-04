# Validação Frontend ANCAR V5.7.1

## Objetivo
Alterar somente o tema inicial padrão para claro, preservando o seletor claro/escuro e a preferência explícita do usuário.

## Comportamento validado
- Sem preferência salva em `ancar-theme`: inicia em `light`.
- Se o usuário selecionar `dark`: o tema escuro é aplicado e persistido.
- Se o usuário selecionar `light`: o tema claro é aplicado e persistido.
- Bootstrap do tema ocorre antes da renderização da aplicação para evitar flash visual.
- Logo 2SEE, TopBar, telas internas e login não foram alterados funcionalmente.

## Validação de fonte
- 99 arquivos TS/TSX analisados.
- 0 erros de transpilação.
- Resultado: PASS.

## Validação de temas
- 10 telas × 2 temas × 2 viewports = 40 cenários.
- 40 PASS / 0 FAIL.

## Validação do login
- 7 viewports.
- 7 PASS / 0 FAIL.

## Versão
- 5.7.1
