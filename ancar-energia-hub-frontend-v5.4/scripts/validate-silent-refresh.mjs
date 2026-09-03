import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const failures = [];
const pass = [];
const check = (name, ok, detail = "") => (ok ? pass : failures).push(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ` — ${detail}` : ""}`);

const auto = read("src/hooks/useAutoRefresh.ts");
const index = read("src/routes/index.tsx");
const esg = read("src/routes/esg.tsx");
const detail = read("src/routes/shoppings.$shoppingId.tsx");
const config = read("src/config.ts");

check("polling permanece em 3 minutos", /REFRESH_INTERVAL_MS\s*=\s*3\s*\*\s*60\s*\*\s*1000/.test(config));
check("polling não recarrega a página", !/location\.reload\(|window\.location\s*=|router\.invalidate\(/.test(auto + index));
check("home não liga loading do portfólio a cada tick", !/setLoadingPortfolio\(true\)/.test(index));
check("home diferencia troca de consulta de polling", /historyQueryRef/.test(index) && /queryChanged/.test(index));
check("ESG diferencia troca de consulta de polling", /detailQueryRef/.test(esg) && /queryChanged/.test(esg));
check("Detalhe diferencia troca de consulta de polling", /queryRef/.test(detail) && /queryChanged/.test(detail));

const routeDir = path.join(root, "src/routes");
const routeFiles = fs.readdirSync(routeDir).filter((f) => f.endsWith(".tsx"));
let animatedSeries = [];
for (const f of routeFiles) {
  const text = fs.readFileSync(path.join(routeDir, f), "utf8");
  if (!text.includes("recharts")) continue;
  const series = [...text.matchAll(/<(Line|Area|Bar|Scatter|Radar|RadialBar|Pie)\b([^>]*)>/g)];
  for (const m of series) {
    if (!/isAnimationActive=\{false\}/.test(m[2])) animatedSeries.push(`${f}:${m[1]}`);
  }
}
check("todas as séries Recharts sem animação no polling", animatedSeries.length === 0, animatedSeries.join(", "));

console.log([...pass, ...failures].join("\n"));
if (failures.length) process.exit(1);
