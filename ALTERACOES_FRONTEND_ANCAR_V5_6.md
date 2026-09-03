# ANCAR Frontend V5.6 — Login Institucional Homologado

## Objetivo
Aplicar à última base V5.5 o conceito visual de login homologado para a nova identidade **ancar**, preservando integralmente a autenticação e as telas internas.

## Alterações realizadas
- Nova composição split-screen institucional baseada no conceito homologado.
- Identidade atual `ancar` aplicada sem referência a Ivanhoe.
- Logo oficial fornecido para homologação tratado como asset transparente do frontend.
- Novo hero com arquitetura de shopping ao entardecer e overlay escuro/vermelho.
- Mensagem principal: gestão inteligente do portfólio ANCAR.
- Blocos visuais de Portfólio, Performance e Sustentabilidade.
- Cards ilustrativos de visão multi-site e energia/emissões no hero.
- Painel de acesso branco com hierarquia visual simplificada e CTA vermelho.
- Rodapé do login com versão `5.6` e indicação de ambiente protegido.
- Favicon atualizado para o símbolo atual da ANCAR.
- Responsividade preservada: em telas `<= 900 px`, o hero é ocultado e o acesso fica centralizado.

## Lógica preservada
- Mesmo `useAuth()` e mesmo endpoint/fluxo de login da V5.5.
- Campo continua sendo **Usuário**, de acordo com o backend atual.
- Usuário não vem preenchido por padrão.
- Exibir/ocultar senha mantido.
- Política de senha existente preservada.
- Sessão de 12 horas preservada.
- Redirecionamento para `/alterar-senha` quando `mustChangePassword=true` preservado.
- Nenhuma alteração em workflows n8n ou APIs.

## Arquivos principais alterados
- `src/routes/login.tsx`
- `src/styles.css`
- `package.json`
- `public/favicon.png`
- `public/favicon.ico`

## Novos assets
- `public/images/ancar-login-mall.jpg`
- `public/images/logo-ancar-v56.png`
- `public/images/logo-ancar-symbol.png`
- `scripts/validate-login-v56.py`

## Versão
- Frontend: `5.6.0`
