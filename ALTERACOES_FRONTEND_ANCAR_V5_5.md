# ANCAR Frontend V5.5 — Nova Tela de Acesso

## Objetivo
Elevar a tela de abertura/login ao mesmo padrão visual premium adotado nos demais projetos corporativos, sem alterar a lógica de autenticação.

## Alterações
- Nova composição split-screen corporativa.
- Hero institucional escuro com marca ANCAR, mensagem executiva e visual conceitual de performance do portfólio.
- Painel de acesso claro com card premium, contraste elevado e hierarquia de leitura revisada.
- Identidade ANCAR reforçada pelo vermelho no CTA e pela marca institucional.
- Ciano mantido como cor funcional do hub/monitoramento.
- Bloco visual de performance com Eficiência CAG, Energia e visão Multi-site.
- Indicadores de confiança: dados protegidos, atualização contínua e análise executiva.
- Área de segurança no formulário.
- Usuário `admin` deixou de vir preenchido por padrão.
- Mantido botão de exibir/ocultar senha.
- Mantida autenticação existente, política mínima de 6 caracteres e sessão de 12 horas.
- Layout responsivo: desktop, notebook, tablet e mobile.

## Responsividade
- Desktop/notebook: hero + login lado a lado.
- Alturas menores: hero compactado automaticamente.
- <= 900 px: hero oculto e formulário centralizado, com logo ANCAR próprio para mobile.

## Arquivos principais alterados
- `src/routes/login.tsx`
- `src/styles.css`
- `package.json`
- `scripts/validate-login-v55.py`
