# ANCAR Frontend V5.7.2 — NSM + coerência potência/status

## Base
- Baseado integralmente na V5.7.1.
- Tema claro continua sendo o padrão no primeiro acesso.
- Tema escuro, logo 2SEE, login homologado e layout compacto foram preservados.

## Alterações
- Preparado o frontend para o **North Shopping Maracanaú (NSM)** no portfólio dinâmico retornado pela API.
- O fallback geográfico já existente para `NSM` foi preservado (Maracanaú/CE).
- Adicionado suporte aos novos diagnósticos do realtime V6.3.4:
  - `powerStatusMismatch`;
  - `chillerPowerWithStatusOff`;
  - `cagPowerWithoutChillerOn`;
  - `auxPowerWithoutChillerOn`;
  - `status_diagnostics`;
  - leituras brutas `*_raw`.
- Quando houver potência incompatível com status OFF, o shopping passa para **Atenção**.
- Criado alerta consolidado **“Potência detectada com chiller desligado”**, mostrando chillers envolvidos e, quando aplicável, kW CAG e Periféricos/BAGPS brutos.
- O alerta informa que os valores brutos continuam registrados para diagnóstico, enquanto equipamentos explicitamente OFF não alimentam os KPIs operacionais.

## Compatibilidade
- Nenhum endpoint foi alterado.
- Compatível com `ANCAR_10_API_FRONTEND_V7_AUTH_ECONOMIA_METAS_FALLBACK_10MIN`.
- Sem alteração na autenticação ou nas configurações do usuário.
