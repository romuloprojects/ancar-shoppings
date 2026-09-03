# ANCAR Frontend V5.6.1 — Hotfix de carregamento do CSS do login

## Motivo
Na implantação da V5.6 o novo markup do login foi carregado, porém o navegador podia reutilizar a folha de estilos anterior. Isso produzia a tela com elementos empilhados e imagens sem o layout homologado.

## Correção
- Atualizado `ancar-ui-version` para `5.6.1`.
- Cache-bust do `styles.css` atualizado para `5.6.1`.
- Criado `public/login-v561.css`, com nome versionado e regras exclusivas da abertura homologada.
- A folha dedicada é carregada depois do CSS principal, garantindo a aplicação do split-screen mesmo se existir cache antigo do CSS global.
- Favicon também recebeu query de versão.
- Login exibe `Versão 5.6.1`.
- Nenhuma alteração em autenticação, APIs, rotas internas ou workflows n8n.
