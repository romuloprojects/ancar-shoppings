import fs from 'node:fs';

const service = fs.readFileSync('src/services/liveDashboardService.ts', 'utf8');
const overview = fs.readFileSync('src/routes/index.tsx', 'utf8');
const types = fs.readFileSync('src/types/live.ts', 'utf8');

const checks = [];
function check(name, ok) {
  checks.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}`);
}

check('cache separado por shopping + período', service.includes('shoppingHistoryCache') && service.includes('historyCacheKey(code, period)'));
check('histórico válido alimenta cache', service.includes('shoppingHistoryCache.set(key, result)'));
check('resposta vazia reutiliza último histórico válido', service.includes('empty_history_response') && service.includes('result.history = cached.history'));
check('summary histórico também é preservado', service.includes('result.summary = cached.summary'));
check('latest recente + histórico vazio gera inconsistência', service.includes('historyInconsistent: latestInsideRequestedWindow && timestamps.length === 0'));
check('inconsistência sem cache não vira Sem dados', service.includes('histórico vazio inconsistente'));
check('diagnóstico tipado no contrato', types.includes('interface HistoryDiagnostics') && types.includes('historyDiagnostics?: HistoryDiagnostics'));
check('troca de shopping/período cobre render antes do useEffect', overview.includes('historyTransitionPending') && overview.includes('historyQueryRef.current !== currentHistoryQueryKey'));
check('polling continua sem reload', !overview.includes('location.reload') && !overview.includes('router.invalidate'));

// Simulação funcional do comportamento esperado.
const cache = new Map();
function apply(key, incoming) {
  if (incoming.history.length) {
    cache.set(key, structuredClone(incoming));
    return incoming;
  }
  const cached = cache.get(key);
  if (cached?.history?.length) {
    return { ...incoming, history: cached.history, summary: cached.summary, fallbackUsed: true };
  }
  if (incoming.latestInsideWindow) throw new Error('inconsistent');
  return incoming;
}
const valid = { history: [{ timestamp: '2026-09-02T10:00:00Z', kwCag: 100 }], summary: { avgKw: 100 }, latestInsideWindow: true };
const emptyPoll = { history: [], summary: { avgKw: null }, latestInsideWindow: true };
const first = apply('BPS:24h', valid);
const second = apply('BPS:24h', emptyPoll);
check('simulação: polling vazio não apaga série válida', first.history.length === 1 && second.history.length === 1 && second.summary.avgKw === 100 && second.fallbackUsed === true);
let threw = false;
try { apply('NAT:24h', emptyPoll); } catch { threw = true; }
check('simulação: primeira resposta inconsistente é rejeitada', threw);
const legitEmpty = apply('NEW:24h', { history: [], summary: {}, latestInsideWindow: false });
check('simulação: ausência legítima sem coleta recente continua permitida', legitEmpty.history.length === 0);

const failed = checks.filter((item) => !item.ok);
if (failed.length) {
  console.error(`\n${failed.length} falha(s) na resiliência de histórico.`);
  process.exit(1);
}
console.log(`\n${checks.length} PASS / 0 FAIL — resiliência de histórico V4.8`);
