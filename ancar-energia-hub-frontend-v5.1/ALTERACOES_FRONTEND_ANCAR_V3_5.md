# ANCAR Frontend V3.5 — ajustes finais da Visão Geral

## Alterações

- Seletor de shopping ordenado alfabeticamente pela sigla (`BAN`, `BLD`, `BPS`, `CVS`, `GOL`, ...).
- Cadastro geográfico mestre para os 17 shoppings já conhecidos, usado apenas para localização/mapa quando necessário.
- Mapa passou a posicionar marcadores pelas coordenadas geográficas reais, removendo âncoras artificiais por estado.
- Unidades muito próximas recebem apenas um pequeno deslocamento visual para evitar sobreposição, mantendo o ponto dentro da região geográfica correspondente.
- Cartão `Qualidade dos Dados` reorganizado para impedir sobreposição do valor/status no gauge, inclusive em 1366×768.
- Favicon substituído pelo símbolo oficial do logotipo ANCAR já utilizado no TopBar.
- Título da página atualizado para `ANCAR | Monitoramento CAG`.
- Removidas referências e integrações específicas do construtor original; Vite agora utiliza os plugins oficiais TanStack Start / React / Tailwind / Nitro.
- `allowedHosts` permanece somente com `ancar-shoppings.facilities-ai.com.br`.

## Localizações mestre

- BAN — Campinas/SP
- BLD — Rio de Janeiro/RJ
- BPS — Rio de Janeiro/RJ
- CVS — São José dos Campos/SP
- GOL — São Bernardo do Campo/SP
- ITA — São Paulo/SP
- MAD — Rio de Janeiro/RJ
- NAT — Natal/RN
- NSF — Fortaleza/CE
- NSJ — Fortaleza/CE
- NSM — Maracanaú/CE
- PAN — Cuiabá/MT
- PVS — Porto Velho/RO
- RDB — Rio de Janeiro/RJ
- SNA — Rio de Janeiro/RJ
- SNI — Nova Iguaçu/RJ
- VSS — Fortaleza/CE
