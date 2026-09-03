import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js");
const source = fs.readFileSync(new URL("../src/utils/history.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    verbatimModuleSyntax: false,
  },
  fileName: "history.ts",
}).outputText;

const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const history = await import(moduleUrl);

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const point = (timestamp, kwCag) => ({
  timestamp,
  kwCag,
  trTotal: kwCag === null ? null : kwCag * 1.2,
  kwTr: kwCag === null ? null : 0.8,
  cop: null,
  temperatureC: 26,
  kwAux: 20,
  peripheralsPct: 10,
  balanceDeviationPct: 1,
  targetDeviationPct: 2,
  activeChillers: 1,
  energyKwh: 10,
  thermalTrh: 12,
  savedKwh: 1,
  avoidedKgCo2: 0.1,
  dataQualityPct: 100,
});

const normalized = history.normalizeShoppingHistory([
  point("2026-09-01T00:10:00.000Z", 30),
  point("invalid", 999),
  point("2026-09-01T00:00:00.000Z", 10),
  point("2026-09-01T00:10:00.000Z", 31),
]);
check(normalized.length === 2, "normalização deve remover timestamp inválido e deduplicar");
check(normalized[0]?.kwCag === 10 && normalized[1]?.kwCag === 31, "normalização deve ordenar e manter a última duplicata");

const withGap = history.buildChartHistory([
  point("2026-09-01T00:00:00.000Z", 10),
  point("2026-09-01T00:20:00.000Z", 20),
], "24h");
check(withGap.length === 3, "24h deve inserir separador nulo quando houver lacuna real");
check(withGap[1]?.kwCag === null, "separador de lacuna deve quebrar a linha do gráfico");
check(Number.isFinite(withGap[0]?.chartTimestamp), "pontos de gráfico devem ter timestamp numérico");

const noGap7d = history.buildChartHistory([
  point("2026-09-01T00:00:00.000Z", 10),
  point("2026-09-01T00:30:00.000Z", 20),
], "7d");
check(noGap7d.length === 2, "7d não deve inventar lacuna entre buckets normais de 30 min");

for (const [period, expected] of [["24h", 86400000], ["7d", 604800000], ["30d", 2592000000]]) {
  const [start, end] = history.getHistoryTimeDomain(period, "2026-09-01T12:00:00.000Z");
  check(end - start === expected, `${period}: domínio temporal incorreto`);
  const tick = history.formatHistoryTick(end, period);
  check(tick.length > 0, `${period}: rótulo do eixo vazio`);
}

check(history.formatHistoryTick(Date.parse("2026-09-01T12:34:00Z"), "24h").includes(":"), "24h deve mostrar hora:minuto");
check(history.formatHistoryTick(Date.parse("2026-09-01T12:34:00Z"), "7d").includes("/"), "7d deve mostrar data");
check(history.formatHistoryTick(Date.parse("2026-09-01T12:34:00Z"), "30d").includes("/"), "30d deve mostrar data");

if (failures.length) {
  console.error(`VALIDAÇÃO DE HISTÓRICO: FAIL (${failures.length})`);
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Períodos validados: 24h, 7d, 30d");
console.log("Ordenação/deduplicação/lacunas/domínio temporal: PASS");
console.log("VALIDAÇÃO DE HISTÓRICO: PASS");
