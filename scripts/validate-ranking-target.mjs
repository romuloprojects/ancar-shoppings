import fs from "node:fs";

const overview = fs.readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const service = fs.readFileSync(new URL("../src/services/dashboardService.ts", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../src/routes/ranking.tsx", import.meta.url), "utf8");

const checks = [
  ["home inicia em eficiência", overview.includes('useState<RankingMetric>("efficiency")')],
  ["home usa desvio percentual com meta", overview.includes('const aHasTarget = a.targetDeviationPct !== null') && overview.includes('deviationDiff')],
  ["home coloca meta antes do fallback", overview.includes('if (aHasTarget !== bHasTarget) return aHasTarget ? -1 : 1')],
  ["home fallback por kW/TR", overview.includes('Sem meta configurada · fallback por kW/TR')],
  ["serviço ranking calcula desvio meta", service.includes('((value - targetKwTr) / targetKwTr) * 100')],
  ["serviço ordena meta antes fallback", service.includes('if (aHasTarget !== bHasTarget) return aHasTarget ? -1 : 1')],
  ["serviço expõe targetDeviationPct", service.includes('targetDeviationPct: row.targetDeviationPct')],
  ["página ranking explica critério", page.includes('Com meta: menor desvio percentual em relação à meta. Sem meta: fallback por kW/TR absoluto.')],
  ["página ranking mostra status meta", page.includes('rankingCriterionLabel') && page.includes('abaixo') && page.includes('acima')],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}`);
  if (!ok) failed++;
}

// Teste funcional sintético do comparador: metas primeiro por desvio; sem meta depois por kW/TR.
const rows = [
  { code: "A", value: 0.70, dev: -2 },
  { code: "B", value: 0.90, dev: -10 },
  { code: "C", value: 0.60, dev: null },
  { code: "D", value: 0.80, dev: 5 },
  { code: "E", value: 0.75, dev: null },
];
rows.sort((a,b)=>{
  const ah=a.dev!==null, bh=b.dev!==null;
  if(ah&&bh){const d=a.dev-b.dev; if(Math.abs(d)>1e-9)return d; return a.value-b.value;}
  if(ah!==bh)return ah?-1:1;
  return a.value-b.value;
});
const order = rows.map(r=>r.code).join(",");
const expected = "B,A,D,C,E";
const functionalOk = order === expected;
console.log(`${functionalOk ? "PASS" : "FAIL"} — ordem sintética ${order} (esperado ${expected})`);
if (!functionalOk) failed++;

if (failed) process.exit(1);
