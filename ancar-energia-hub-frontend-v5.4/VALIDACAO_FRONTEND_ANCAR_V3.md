# Validação ANCAR — Configuração Central + Frontend V3

## Resultado

- Verificações estruturais/funcionais offline: **49 PASS / 0 FAIL**
- Shoppings cadastrados nesta etapa: **BLD, BAN, BPS, CVS**
- Pontos WebCTRL cadastrados: **47**
- Coleta realtime: **5 minutos**
- Frontend: **kW / kWh** para potência e energia; nenhuma exibição de MW/MWh.

## N8N validado

- JSON e conexões dos 5 workflows.
- Sintaxe dos 18 Code nodes.
- Setup idempotente com `shopping_settings_history`, view de configuração corrente e snapshot da configuração na telemetria.
- Gravação versionada e serializada por shopping via função PostgreSQL `ancar.save_shopping_settings`.
- API de configurações GET/PUT/OPTIONS; PUT grava PostgreSQL e atualiza cache Redis.
- Realtime busca a configuração vigente de cada shopping em toda execução.
- Baseline, meta, fator de emissão e limites de alerta não possuem valores de negócio hardcoded.
- Cálculos de energia/economia em kWh e emissões em kgCO₂.
- API de dashboard fornece portfólio, histórico e resumos reais.
- CORS das APIs de frontend restrito a `https://ancar-shoppings.facilities-ai.com.br`.

## Simulação de cálculo

Foram executados cenários sintéticos sobre o mesmo Code node do workflow realtime:

- BLD: balanço elétrico, kW/TR, COP, chiller ativo, kWh, economia estimada e emissões estimadas — PASS.
- CAG mista: kW/TR elétrico permanece disponível, COP global permanece `null`, economia elétrica baseada no baseline e versão da configuração é carregada — PASS.
- Sem baseline/fator configurados: economia e emissões permanecem `null`, nunca zero inventado — PASS.

## Frontend validado

- Sintaxe TypeScript/TSX: 0 erros sintáticos.
- 191 imports locais resolvidos; 0 ausentes.
- Diretório de mocks removido e nenhuma referência a mocks ativa.
- Todas as rotas principais adaptadas: Visão Geral, Shoppings, Detalhe, Ranking, Análises, ESG/Energia e Emissões, Alertas, Relatórios e Configurações.
- Nenhuma referência a vazão, Delta T ou aproximação.
- Nenhuma exibição do modelo da CAG em Configurações.
- Nenhuma opção “Todos os Shoppings”.
- Configurações são por shopping e o botão Salvar chama a API n8n.
- Ao salvar, o frontend força atualização imediata dos dados de configuração; o coletor passa a usar a nova versão no próximo ciclo de 5 minutos.

## Limitação da validação local

O build Vite completo não foi executado neste ambiente porque as dependências npm não estão instaladas e o ambiente de execução não possui acesso confiável ao registry para instalá-las. A validação final de compilação deve ocorrer no build do Easypanel, que possui o ambiente real do projeto.
