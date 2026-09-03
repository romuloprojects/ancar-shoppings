# Validação Frontend ANCAR V5.6.1

## Correção validada
O hotfix elimina a dependência do cache da folha global para a tela de login. Além do cache-bust atualizado, o layout homologado possui agora uma folha dedicada `/login-v561.css?v=5.6.1`, carregada depois do CSS principal.

## Login
Validação Playwright executada com a folha dedicada em 7 viewports:
- 1920×1080 — PASS
- 1792×862 — PASS
- 1524×722 — PASS
- 1366×768 — PASS
- 1024×650 — PASS
- 900×700 — PASS
- 390×844 — PASS

Resultado: **7/7 PASS**, sem overflow ou clipping do card/hero.

## Verificações adicionais
- `ancar-ui-version = 5.6.1` — PASS
- cache-bust do CSS global `ancar-ui=5.6.1` — PASS
- stylesheet dedicado `/login-v561.css?v=5.6.1` — PASS
- regras `.login-v56`, `.login-v56-hero` e `.login-v56-access` presentes — PASS
- chaves CSS balanceadas — PASS
- versão exibida no login `5.6.1` — PASS

## Escopo
Nenhuma alteração foi feita na autenticação, endpoints, telas internas ou workflows n8n.
