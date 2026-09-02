# ANCAR Frontend V4.6 — atualização silenciosa

- Polling continua em 3 minutos.
- Nenhum reload de página ou router invalidate.
- Home não alterna loading durante polling após a carga inicial.
- Histórico, ESG, Relatórios e Detalhe só mostram loading quando shopping/período realmente mudam e ainda não existe dado compatível em memória.
- Todas as séries Recharts usam `isAnimationActive={false}` para impedir reanimação completa ao receber novos dados.
- Último estado válido permanece visível enquanto a nova resposta é buscada.
- Falha transitória não apaga o conteúdo atual.
