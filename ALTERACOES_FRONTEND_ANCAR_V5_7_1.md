# ANCAR Frontend V5.7.1 — Tema claro como padrão

## Alteração
- O tema padrão de abertura passou de escuro para claro.
- Quando não existe preferência salva em `localStorage`, a aplicação inicia em `light`.
- O botão de tema permanece disponível para o usuário alternar para o modo escuro.
- Quando o usuário escolhe um tema, a preferência continua persistida em `localStorage` pela chave `ancar-theme`.
- Nenhum componente, rota, API, autenticação ou workflow foi alterado.

## Arquivos alterados
- `src/routes/__root.tsx`
- `src/components/ThemeToggle.tsx`
- `package.json`

## Versão
- `5.7.1`
