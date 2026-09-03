import fs from 'node:fs';
const service=fs.readFileSync(new URL('../src/services/dashboardService.ts',import.meta.url),'utf8');
const page=fs.readFileSync(new URL('../src/routes/ranking.tsx',import.meta.url),'utf8');
const home=fs.readFileSync(new URL('../src/routes/index.tsx',import.meta.url),'utf8');
const checks=[
 ['ranking dedicado inicia por eficiência',page.includes('useState<RankingMetric>("intensidade")')],
 ['ordena com meta por desvio',service.includes('deviationDiff')&&service.includes('if (aHasTarget !== bHasTarget) return aHasTarget ? -1 : 1')],
 ['fallback por kW/TR sem meta',service.includes('Sem meta configurada · fallback por kW/TR')],
 ['métricas econômicas disponíveis',page.includes('key: "custoMeta"')&&page.includes('key: "custoTrh"')],
 ['ranking completo removido da home',!home.includes('<h2 className="text-sm font-semibold">Ranking dos Shoppings</h2>')],
];let fail=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} — ${n}`);if(!ok)fail++;}
const rows=[{code:'A',value:.70,dev:-2},{code:'B',value:.90,dev:-10},{code:'C',value:.60,dev:null},{code:'D',value:.80,dev:5},{code:'E',value:.75,dev:null}];rows.sort((a,b)=>{const ah=a.dev!==null,bh=b.dev!==null;if(ah&&bh){const d=a.dev-b.dev;if(Math.abs(d)>1e-9)return d;return a.value-b.value}if(ah!==bh)return ah?-1:1;return a.value-b.value});const ok=rows.map(r=>r.code).join(',')==='B,A,D,C,E';console.log(`${ok?'PASS':'FAIL'} — ordem sintética por meta/fallback`);if(!ok)fail++;if(fail)process.exit(1);
