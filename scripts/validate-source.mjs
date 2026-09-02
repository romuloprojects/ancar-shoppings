import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
const root=process.cwd(); const src=path.join(root,'src');
const files=[]; function walk(d){for(const n of fs.readdirSync(d)){const p=path.join(d,n);const st=fs.statSync(p);if(st.isDirectory())walk(p);else if(/\.(ts|tsx)$/.test(n))files.push(p)}} walk(src);
const errors=[];
for(const file of files){const text=fs.readFileSync(file,'utf8');const out=ts.transpileModule(text,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true,fileName:file});for(const d of out.diagnostics||[]){if(d.category===ts.DiagnosticCategory.Error)errors.push(`${path.relative(root,file)}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`)}}
function assert(cond,msg){if(!cond)errors.push(msg)}
const styles=fs.readFileSync(path.join(src,'styles.css'),'utf8');
assert(styles.includes('grid-template-rows: 116px minmax(320px, 1fr) 330px'),'Visão Geral: proporção V3.9 ausente');
assert(styles.includes('grid-template-columns: minmax(0, 5fr) minmax(0, 3fr) minmax(0, 2fr) minmax(0, 2fr) !important'),'Visão Geral: faixa inferior 5/3/2/2 ausente');
assert(styles.includes('.ranking-workspace-body'),'Ranking: workspace lateral ausente');
assert(styles.includes('.analysis-workspace-body'),'Análises: workspace lateral ausente');
assert(styles.includes('.alerts-workspace-body'),'Alertas: workspace lateral ausente');
assert(styles.includes('.energy-workspace-body'),'Energia: workspace lateral ausente');
assert(styles.includes('.reports-workspace-body'),'Relatórios: workspace lateral ausente');
assert(styles.includes('grid-template-columns:170px minmax(0,1fr)'),'Configurações: navegação lateral homologada ausente');
const allSrc=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
assert(allSrc.includes('grid-template-columns: repeat(6, minmax(0, 1fr)) !important'),'V4.8: grid de 6 KPIs compactos ausente');
assert(allSrc.includes('const portfolioPageSize = 6'),'Visão Geral: paginação deve voltar a 6 cards por página');
assert(allSrc.includes('data-ancar-ui-version="4.8"'),'V4.8: marcador de versão da Visão Geral ausente');
assert(allSrc.includes('h-[92px]'),'V4.8: KPI compacto de 92px ausente');
assert(allSrc.includes('min-h-[146px]'),'ShoppingCard: altura original de 146px ausente');
assert(allSrc.includes('portfolio-map-root') && allSrc.includes('portfolio-map-legend'),'BrazilMap: estrutura flexível V3.9 ausente');
assert(allSrc.includes('overview-chart h-[272px]'),'Visão Geral: altura-base original do gráfico ausente');
assert(!/\bMWh\b/.test(allSrc),'Unidade MWh encontrada no frontend');
assert(!/\bMW\b/.test(allSrc),'Unidade MW encontrada no frontend');
assert(!allSrc.includes('Todos os Shoppings'),'Opção Todos os Shoppings não deve existir');
assert(allSrc.includes('detail-behavior-grid'),'Detalhe: composição gráfico + equipamentos ausente');
assert(allSrc.includes('analysis-workspace-body'),'Análises: composição principal ausente');
assert(allSrc.includes('alerts-workspace-body'),'Alertas: composição fila + filtros ausente');
assert(allSrc.includes('energy-workspace-body'),'Energia: composição gráfico + resumo ausente');
assert(allSrc.includes('reports-workspace-body'),'Relatórios: composição biblioteca + prévia ausente');

const topBar=fs.readFileSync(path.join(src,'components','TopBar.tsx'),'utf8');
assert(topBar.includes('a.code.localeCompare(b.code, "pt-BR")'),'TopBar: seletor de shoppings deve ordenar por sigla');
const locations=fs.readFileSync(path.join(src,'data','shoppingLocations.ts'),'utf8');
for(const code of ['BAN','BLD','BPS','CVS','GOL','ITA','MAD','NAT','NSF','NSJ','NSM','PAN','PVS','RDB','SNA','SNI','VSS']) assert(locations.includes(`${code}:`),`Localização mestre ausente: ${code}`);
const map=fs.readFileSync(path.join(src,'components','BrazilMap.tsx'),'utf8');
assert(map.includes('const point = project(shopping.latitude, shopping.longitude)'),'Mapa: marcadores devem usar latitude/longitude reais');
assert(!map.includes('STATE_ANCHORS'),'Mapa: âncoras artificiais por estado não devem ser usadas');
const health=fs.readFileSync(path.join(src,'components','PortfolioHealthCard.tsx'),'utf8');
assert(health.includes('portfolio-health-gauge'),'Qualidade dos Dados: gauge compacto ausente');
assert(health.includes('portfolio-health-label'),'Qualidade dos Dados: status deve ficar fora do centro do gauge');
const viteConfig=fs.readFileSync(path.join(root,'vite.config.ts'),'utf8');
assert(viteConfig.includes('@tanstack/react-start/plugin/vite'),'Vite: configuração TanStack Start padrão ausente');
const formerBuilder=['lova','ble'].join('');
assert(!viteConfig.toLowerCase().includes(formerBuilder),'Vite: referência ao construtor anterior encontrada');
const packageJson=fs.readFileSync(path.join(root,'package.json'),'utf8');
assert(!packageJson.toLowerCase().includes(formerBuilder),'package.json: referência ao construtor anterior encontrada');
assert(fs.existsSync(path.join(root,'public','favicon.png')),'Favicon ANCAR PNG ausente');
const forbiddenText=[];
function scanForbidden(d){for(const n of fs.readdirSync(d)){const p=path.join(d,n);const st=fs.statSync(p);if(st.isDirectory()){if(n==='validation' || n==='node_modules')continue;scanForbidden(p)}else if(/\.(?:ts|tsx|js|mjs|json|md|toml|html|css)$/.test(n)){const t=fs.readFileSync(p,'utf8');if(t.toLowerCase().includes(formerBuilder))forbiddenText.push(path.relative(root,p));}}}
scanForbidden(root);
assert(forbiddenText.length===0,`Referências ao construtor anterior encontradas: ${forbiddenText.join(', ')}`);

const fmt=fs.readFileSync(path.join(src,'utils','format.ts'),'utf8');
assert(/minimumFractionDigits\s*:\s*2/.test(fmt)&&/maximumFractionDigits\s*:\s*2/.test(fmt),'formatKwTr deve exibir exatamente 2 casas');
for(const route of ['index.tsx','shoppings.tsx','shoppings.$shoppingId.tsx','ranking.tsx','analises.tsx','alertas.tsx','esg.tsx','relatorios.tsx','configuracoes.tsx']) assert(fs.existsSync(path.join(src,'routes',route)),`Rota ausente: ${route}`);

// V3.6 — atualização silenciosa, horário real da telemetria e histórico temporal coerente.
const config=fs.readFileSync(path.join(src,'config.ts'),'utf8');
assert(config.includes('REFRESH_INTERVAL_MS = 3 * 60 * 1000'),'V3.6: polling deve ser de 3 minutos');
const refreshHook=fs.readFileSync(path.join(src,'hooks','useAutoRefresh.ts'),'utf8');
assert(refreshHook.includes('visibilitychange'),'V3.6: retorno à aba deve disparar verificação de atualização');
assert(topBar.includes('🟢 Última atualização'),'V3.6: texto padrão de última atualização ausente');
assert(topBar.includes('selectedShopping?.lastUpdate'),'V3.6: TopBar deve usar collectedAt mapeado da telemetria');
assert(!topBar.includes('formatRelative(lastUpdate'),'V3.6: TopBar não deve exibir horário do polling como horário dos dados');
const historyUtils=fs.readFileSync(path.join(src,'utils','history.ts'),'utf8');
assert(historyUtils.includes('normalizeShoppingHistory'),'V3.6: normalização temporal ausente');
assert(historyUtils.includes('buildChartHistory'),'V3.6: tratamento de lacunas do gráfico ausente');
assert(historyUtils.includes('getHistoryTimeDomain'),'V3.6: domínio temporal por período ausente');
const liveService=fs.readFileSync(path.join(src,'services','liveDashboardService.ts'),'utf8');
assert(liveService.includes('normalizeShoppingHistory'),'V3.6: API frontend deve ordenar/deduplicar o histórico recebido');
for(const route of ['index.tsx','shoppings.$shoppingId.tsx','analises.tsx','esg.tsx','relatorios.tsx']){
  const text=fs.readFileSync(path.join(src,'routes',route),'utf8');
  assert(text.includes('chartTimestamp'),`V3.6 ${route}: eixo temporal real ausente`);
  assert(text.includes('formatHistoryTick'),`V3.6 ${route}: formatação por período ausente`);
  assert(!text.includes('type="monotone"'),`V3.6 ${route}: interpolação monotone não deve ser usada em telemetria`);
}
// V4.5 — home: 6 KPIs compactos, comparativos históricos e guard de layout preservado.
const overviewRoute=fs.readFileSync(path.join(src,'routes','index.tsx'),'utf8');
assert(overviewRoute.includes('const OVERVIEW_LAYOUT_V45_CSS'), 'V4.8: guard runtime da Visão Geral ausente');
assert(overviewRoute.includes('@media (min-width: 1024px)'), 'V4.8: guard deve depender apenas da largura desktop, sem min-height');
assert(!overviewRoute.match(/OVERVIEW_LAYOUT_V45_CSS[\s\S]*?@media \(min-width: 1024px\) and \(min-height:/), 'V4.8: guard não pode depender de min-height');
assert(overviewRoute.includes('grid-template-rows: repeat(2, 146px) !important'), 'V4.8: Portfólio deve ter duas linhas de 146px');
assert(overviewRoute.includes('height: 302px !important'), 'V4.8: área dos 6 ShoppingCards deve ter 302px');
assert(overviewRoute.includes('height: 408px !important'), 'V4.8: faixa inferior deve reservar 408px');
assert(overviewRoute.includes('grid-template-rows: 408px !important'), 'V4.8: todos os painéis inferiores devem compartilhar a mesma track');
assert(overviewRoute.includes('overflow-y: auto !important'), 'V4.8: app-inset deve permitir scroll vertical da página');
assert(overviewRoute.includes('data-ancar-overview-layout="4.8"'), 'V4.8: style guard precisa estar montado na rota');
const rootRoute=fs.readFileSync(path.join(src,'routes','__root.tsx'),'utf8');
assert(rootRoute.includes('ancar-ui=4.8.0'), 'V4.8: cache-bust do stylesheet ausente');
assert(rootRoute.includes('ancar-ui-version') && rootRoute.includes('4.8.0'), 'V4.8: meta de versão ausente');
assert(health.includes('text-[11px]'), 'V4.8: valor central do gauge deve permanecer pequeno');
assert(map.includes('preserveAspectRatio="xMidYMid meet"'), 'V4.8: mapa deve preservar proporção geográfica');

// V4.5 — comparativos e ranking vs meta.
const kpiCard=fs.readFileSync(path.join(src,'components','KpiCard.tsx'),'utf8');
assert(!kpiCard.includes('buildSparklineGeometry'),'V4.8: sparkline lateral deve ter sido removido dos KPIs');
assert(kpiCard.includes('comparisonValue'),'V4.8: KpiCard deve aceitar comparativo do período');
assert(overviewRoute.includes('label="Temperatura Externa"'),'V4.8: card de Temperatura Externa ausente');
assert(overviewRoute.includes('comparisonLabel={comparisonLabel}'),'V4.8: KPIs não estão ligados ao comparativo temporal');
assert(overviewRoute.includes('targetDeviationPct'),'V4.8: ranking não exibe desvio vs meta');
assert(overviewRoute.includes('abaixo') && overviewRoute.includes('acima'),'V4.8: texto abaixo/acima da meta ausente');
const comparisonUtils=fs.readFileSync(path.join(src,'utils','comparison.ts'),'utf8');
assert(comparisonUtils.includes('vs ontem') && comparisonUtils.includes('vs semana passada') && comparisonUtils.includes('vs mês anterior'),'V4.8: rótulos dos períodos comparativos ausentes');
assert(comparisonUtils.includes('targetDeviationPct'),'V4.8: cálculo de desvio vs meta ausente');
const liveTypes=fs.readFileSync(path.join(src,'types','live.ts'),'utf8');
assert(liveTypes.includes('PeriodComparison') && liveTypes.includes('avgTemperatureC'),'V4.8: contrato de comparação da API ausente');

// Imports locais @/ devem apontar para arquivos reais.
for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  for(const match of text.matchAll(/from\s+["']@\/([^"']+)["']/g)){
    const target=path.join(src,match[1]);
    const candidates=[target,`${target}.ts`,`${target}.tsx`,path.join(target,'index.ts'),path.join(target,'index.tsx')];
    assert(candidates.some(fs.existsSync),`${path.relative(root,file)}: import local ausente @/${match[1]}`);
  }
}

assert(overviewRoute.includes('useState<RankingMetric>("efficiency")'), 'V4.8: Ranking da Visão Geral deve iniciar em Eficiência Energética');
assert(overviewRoute.includes('label: "Eficiência Energética", unit: "kW/TR"'), 'V4.8: rótulo Eficiência Energética ausente no Ranking da home');
const rankingRoute=fs.readFileSync(path.join(root,'src/routes/ranking.tsx'),'utf8');
assert(rankingRoute.includes('key: "intensidade"') && rankingRoute.includes('label: "Eficiência Energética"'), 'V4.8: página Ranking deve exibir Eficiência Energética mantendo a chave interna intensidade');
console.log(`TS/TSX analisados: ${files.length}`); console.log(`Erros: ${errors.length}`); if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('VALIDAÇÃO DE FONTE: PASS');
