# ANCAR Frontend V5.7 — Login final + marca 2SEE + tema claro

## Alterações
- Removidos do hero do login os dois cards flutuantes de Performance do Portfólio e Sustentabilidade, conforme homologação.
- Mantidos hero, mensagem principal e os três cards inferiores de Portfólio, Performance e Sustentabilidade.
- Logo 2SEE fornecido pelo usuário incorporado ao TopBar global, na faixa entre controles/última atualização e o status do sistema.
- Em resoluções menores, a marca 2SEE também aparece no painel responsivo de controles.
- Botão global de alternância entre tema escuro e claro adicionado ao TopBar.
- Preferência de tema persistida em `localStorage` (`ancar-theme`) e aplicada antes da pintura da página.
- Tema claro implementado por tokens, cobrindo shell, sidebar, cards, tabelas, formulários, menus, diálogos, gráficos, tooltips e mapa.
- Logo ANCAR do TopBar alterna automaticamente: branca no tema escuro e vermelha no tema claro.
- Mapa do Brasil e tooltips/gráfico da Visão Geral deixaram de usar superfícies dark hardcoded.
- Versão do frontend: 5.7.0.

## Sem alteração
- autenticação e sessão;
- APIs/endpoints;
- polling e dados;
- regras de negócio;
- workflows n8n.
