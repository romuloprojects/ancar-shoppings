import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
const root=process.cwd(), src=path.join(root,'src'); const files=[];
function walk(d){for(const n of fs.readdirSync(d)){const p=path.join(d,n),st=fs.statSync(p);if(st.isDirectory())walk(p);else if(/\.(ts|tsx)$/.test(n))files.push(p)}} walk(src);
const errors=[]; const assert=(c,m)=>{if(!c)errors.push(m)};
for(const file of files){const text=fs.readFileSync(file,'utf8');const out=ts.transpileModule(text,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true,fileName:file});for(const d of out.diagnostics||[])if(d.category===ts.DiagnosticCategory.Error)errors.push(`${path.relative(root,file)}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`)}
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const overview=read('src/routes/index.tsx'), rootRoute=read('src/routes/__root.tsx'), settings=read('src/routes/configuracoes.tsx'), detail=read('src/routes/shoppings.$shoppingId.tsx'), ranking=read('src/routes/ranking.tsx'), analysis=read('src/routes/analises.tsx'), energy=read('src/routes/esg.tsx'), reports=read('src/routes/relatorios.tsx'), alerts=read('src/routes/alertas.tsx'), shoppingCard=read('src/components/ShoppingCard.tsx'), liveTypes=read('src/types/live.ts'), svc=read('src/services/liveDashboardService.ts'), top=read('src/components/TopBar.tsx'), config=read('src/config.ts');
assert(overview.includes('data-ancar-ui-version="5.1"'),'V5.1: marcador da home ausente');
assert(rootRoute.includes('ancar-ui=5.1.0')&&rootRoute.includes('content: "5.1.0"'),'V5.1: versão/cache bust ausente');
assert(overview.includes('Desempenho vs Metas')&&overview.includes('Resumo Econômico'),'V5.1: blocos novos da Home ausentes');
assert(!overview.includes('<h2 className="text-sm font-semibold">Ranking dos Shoppings</h2>'),'V5.1: Ranking completo não deve ocupar a Home');
assert(overview.includes('const portfolioPageSize = 6'),'Home: Portfólio deve paginar 6 cards');
assert(overview.includes('grid-template-rows: repeat(2, 146px) !important'),'Home: Portfólio 3x2 ausente');
assert(overview.includes('grid-template-columns: minmax(0, 5.4fr) minmax(260px, 2.6fr) minmax(280px, 3fr) !important'),'Home: composição gráfico/metas/economia ausente');
assert(shoppingCard.includes('Custo acima')&&shoppingCard.includes('vs meta'),'ShoppingCard: eficiência/meta/custo ausentes');
assert(settings.includes('Meta CAG')&&settings.includes('Meta Chillers')&&settings.includes('Tarifa de energia'),'Configurações: três campos esperados ausentes');
for(const forbidden of ['Baseline kW/TR','Fator de emissão','Desvio máximo de balanço','Periféricos — atenção','Dados desatualizados após']) assert(!settings.includes(forbidden),`Configurações: campo não esperado ainda visível: ${forbidden}`);
assert(detail.includes('Performance vs Metas')&&detail.includes('Resumo Econômico')&&detail.includes('Desempenho dos Chillers'),'Detalhe: conceito de metas/economia/chillers ausente');
assert(ranking.includes('Custo acima da meta')&&ranking.includes('R$/TRh'),'Ranking: métricas econômicas ausentes');
assert(analysis.includes('Custo energético')&&analysis.includes('Custo acima da meta'),'Análises: métricas econômicas ausentes');
assert(energy.includes('Custo energético')&&energy.includes('R$/TRh')&&energy.includes('Custo acima da meta'),'Energia: KPIs econômicos ausentes');
assert(reports.includes('custo_energia_brl')&&reports.includes('Custo acima meta'),'Relatórios: exportação econômica ausente');
assert(alerts.includes('Meta CAG')&&alerts.includes('Meta Chillers'),'Alertas: critérios por metas ausentes');
assert(liveTypes.includes('targetChillerKwTr')&&liveTypes.includes('energyTariffBrlMwh'),'Contrato: novas configurações ausentes');
assert(liveTypes.includes('energyCostBrl')&&liveTypes.includes('costAboveTargetBrl')&&liveTypes.includes('costPerTrhBrl'),'Contrato: indicadores econômicos ausentes');
assert(svc.includes('targetChillerKwTr')&&svc.includes('energyTariffBrlMwh'),'Serviço: novas configurações não normalizadas');
assert(svc.includes('Valores mantidos pelo último válido')&&svc.includes('CAG acima da meta de eficiência'),'Alertas: aquisição/meta não integrados');
assert(config.includes('REFRESH_INTERVAL_MS = 3 * 60 * 1000'),'Polling deve permanecer em 3 min');
assert(top.includes('getPortfolioSystemStatus')&&top.includes('systemStatus.label'),'TopBar deve usar saúde real da aquisição');
for(const route of ['index.tsx','shoppings.tsx','shoppings.$shoppingId.tsx','ranking.tsx','analises.tsx','alertas.tsx','esg.tsx','relatorios.tsx','configuracoes.tsx']) assert(fs.existsSync(path.join(src,'routes',route)),`Rota ausente ${route}`);
for(const route of ['index.tsx','shoppings.$shoppingId.tsx','analises.tsx','esg.tsx','relatorios.tsx']){const text=read(`src/routes/${route}`);assert(text.includes('chartTimestamp'),`${route}: eixo temporal real ausente`);assert(text.includes('formatHistoryTick'),`${route}: formatter temporal ausente`);assert(!text.includes('type="monotone"'),`${route}: interpolação monotone proibida`);}
for(const file of files){const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(/from\s+["']@\/([^"']+)["']/g)){const t=path.join(src,m[1]), candidates=[t,`${t}.ts`,`${t}.tsx`,path.join(t,'index.ts'),path.join(t,'index.tsx')];assert(candidates.some(fs.existsSync),`${path.relative(root,file)}: import ausente @/${m[1]}`)}}
console.log(`TS/TSX analisados: ${files.length}`);console.log(`Erros: ${errors.length}`);if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log('VALIDAÇÃO DE FONTE V5.1: PASS');
