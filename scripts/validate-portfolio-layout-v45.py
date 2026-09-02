from pathlib import Path
import re, json, sys
from playwright.sync_api import sync_playwright

root=Path.cwd()
route=(root/'src/routes/index.tsx').read_text()
m=re.search(r'const OVERVIEW_LAYOUT_V45_CSS = `([\s\S]*?)`;', route)
if not m:
    raise AssertionError('OVERVIEW_LAYOUT_V45_CSS não encontrado')
v45_css=m.group(1)
required=['@media (min-width: 1024px)','grid-template-columns: repeat(6, minmax(0, 1fr)) !important','grid-template-rows: repeat(2, 146px) !important','height: 302px !important','height: 408px !important','grid-template-rows: 408px !important','overflow-y: auto !important']
missing=[x for x in required if x not in v45_css]
if missing: raise AssertionError('Regras V4.6 ausentes: '+', '.join(missing))
if 'min-height: 650px' in v45_css: raise AssertionError('V4.6 ainda depende de min-height')

src=(root/'src/data/brazilMapPaths.ts').read_text()
pm=re.search(r'export const BRAZIL_OUTLINE_PATH =\s*\n\s*"([^"]+)";',src)
if not pm: raise AssertionError('Path Brasil ausente')
path=pm.group(1)

def card(i):
    code=['BLD','BAN','BPS','CVS','GOL','ITA'][i]
    return f'''<a class="group relative flex shopping-card"><span class="dot"></span><div class="head"><span class="building">▣</span><div><b>{code}</b><small>⌖ Cidade/UF</small></div></div><div class="metrics"><div><strong>{i*5}</strong><em>kW</em><small>Potência</small></div><div><strong>—</strong><em>kW/TR</em><small>kW/TR</small></div><div><strong>100</strong><em>%</em><small>Dados</small></div></div><div class="status">Ótimo</div></a>'''
cards=''.join(card(i) for i in range(6))

# Inclui deliberadamente regras legadas conflitantes ANTES do guard, para validar que o runtime style vence.
legacy='''
@media (min-width:1024px) and (min-height:650px){
 .app-inset{height:100vh;overflow:hidden}.dashboard-main{height:calc(100vh - 64px);overflow:hidden}.overview-dashboard{height:100%;overflow:hidden;display:grid;grid-template-rows:86px minmax(220px,1.16fr) minmax(190px,.92fr)}
 .overview-portfolio-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,3fr) minmax(0,2fr) minmax(0,2fr)}
 .overview-portfolio-cards{flex:1 1 auto;grid-template-columns:repeat(3,minmax(0,1fr));overflow:hidden}.overview-portfolio-cards>a{min-height:0;height:100%}
 .overview-map-panel .portfolio-map-svg{max-height:145px!important}
}
@media (min-width:1024px) and (max-height:800px){.overview-dashboard{grid-template-rows:80px minmax(205px,1.1fr) minmax(176px,.9fr)}.overview-map-panel .portfolio-map-svg{max-height:116px!important}}
'''
base='''
*{box-sizing:border-box}html,body{margin:0;background:#061323;color:#eef4ff;font-family:Arial,sans-serif}body{height:100vh;overflow:hidden}.app-shell{display:flex;width:100%;height:100vh;overflow:hidden}.side{flex:0 0 68px}.app-inset{display:flex;min-width:0;flex:1;flex-direction:column}.top{flex:0 0 64px;height:64px}.dashboard-main{padding:20px 24px}.overview-dashboard{display:grid}.overview-kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}.overview-primary-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.overview-portfolio-grid{display:grid}.kpi,.panel,.overview-health-panel{background:#0a1728;border:1px solid #19304a;border-radius:14px}.overview-portfolio-panel,.overview-map-panel,.overview-insights-panel{display:flex;flex-direction:column}.panel-title{height:20px;margin-bottom:12px}.overview-portfolio-cards{display:grid}.shopping-card{position:relative;display:flex;flex-direction:column;overflow:hidden;border:1px solid #17304a;border-radius:12px;padding:14px;color:inherit;text-decoration:none}.dot{position:absolute;right:12px;top:12px;width:10px;height:10px;border-radius:50%;background:#2be19a}.head{display:flex;align-items:center;gap:10px}.building{display:grid;width:40px;height:40px;place-items:center;border-radius:50%}.head b{display:block;font-size:16px}.head small{display:block;font-size:10px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);margin-top:12px;text-align:center}.metrics strong{display:block;font-size:15px}.metrics em,.metrics small{display:block;font-size:9px}.status{margin-top:auto;padding:4px;text-align:center;font-size:10px}.mt-3.flex{display:flex;align-items:center;justify-content:space-between;height:28px;margin-top:12px;font-size:10px}.portfolio-map-root{display:flex;flex:1;min-height:0;flex-direction:column}.portfolio-map-svg{display:block;width:100%}.portfolio-map-legend{display:flex;align-items:center;gap:18px;font-size:9px}.overview-insights-list{flex:1}.overview-health-panel{overflow:hidden}.portfolio-health-card{display:flex;flex-direction:column;height:100%}.portfolio-health-gauge{display:grid;place-items:center;border:7px solid #24df93;border-radius:50%;margin-inline:auto}.portfolio-health-rows{margin-top:10px}.healthrow{padding:8px}.portfolio-health-footer{margin-top:auto}
'''
html=f'''<!doctype html><html><head><meta charset="utf-8"><style>{base}{legacy}</style></head><body><div class="app-shell"><aside class="side"></aside><main class="app-inset"><header class="top"></header><main class="dashboard-main"><style>{v45_css}</style><div class="overview-dashboard"><div class="overview-kpis">{''.join('<div class="kpi"></div>' for _ in range(6))}</div><div class="overview-primary-grid"><div class="panel"></div><div class="panel"></div></div><div class="overview-portfolio-grid"><section class="panel overview-portfolio-panel"><div class="panel-title">Visão do Portfólio</div><div class="overview-portfolio-cards">{cards}</div><div class="mt-3 flex"><span>Exibindo 1–6 de 7</span><span>‹ 1 2 ›</span></div></section><section class="panel overview-map-panel"><div class="panel-title">Mapa / Distribuição</div><div class="portfolio-map-root"><svg class="portfolio-map-svg" viewBox="0 0 420 360" preserveAspectRatio="xMidYMid meet"><path id="br" d="{path}" fill="#0b263b" stroke="#24a5c7"/></svg><div class="portfolio-map-legend"><span>● RJ (3)</span><span>● SP (4)</span></div></div></section><section class="panel overview-insights-panel"><div class="panel-title">Insights</div><div class="overview-insights-list"></div></section><div class="overview-health-panel"><section class="portfolio-health-card"><div class="panel-title">Qualidade</div><div class="portfolio-health-gauge"><span class="metric-value">99</span></div><div class="portfolio-health-rows"><div class="healthrow">Pontos OK</div><div class="healthrow">Online</div></div><div class="portfolio-health-footer">3 min</div></section></div></div></div></main></main></div></body></html>'''

out=root/'validation'/'portfolio-layout-v45'; out.mkdir(parents=True,exist_ok=True)
# inclui alturas abaixo de 650 para provar independência de resolução vertical
viewports=[(1024,580),(1280,600),(1366,640),(1366,650),(1524,700),(1524,722),(1792,862),(1905,902),(1920,1080)]
results=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for w,h in viewports:
        page=browser.new_page(viewport={'width':w,'height':h}); page.set_content(html)
        m=page.evaluate('''() => {const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],r=e=>{const x=e.getBoundingClientRect();return {x:x.x,y:x.y,w:x.width,h:x.height,b:x.bottom}}; const p=q('.overview-portfolio-panel'),cs=qa('.shopping-card'),ps=[q('.overview-portfolio-panel'),q('.overview-map-panel'),q('.overview-insights-panel'),q('.overview-health-panel')], inset=q('.app-inset'); return {v:{w:innerWidth,h:innerHeight},p:r(p),pc:p.clientHeight,psh:p.scrollHeight,rows:[...new Set(cs.map(c=>Math.round(c.getBoundingClientRect().y)))],cards:cs.map(r),panels:ps.map(r),map:r(q('#br')),svg:r(q('.portfolio-map-svg')),legend:r(q('.portfolio-map-legend')),gauge:r(q('.portfolio-health-gauge')),font:parseFloat(getComputedStyle(q('.metric-value')).fontSize),inset:{c:inset.clientHeight,s:inset.scrollHeight,oy:getComputedStyle(inset).overflowY}}}''')
        hs=[x['h'] for x in m['panels']]
        m['ok']=len(m['cards'])==6 and len(m['rows'])==2 and m['psh']<=m['pc']+1 and max(hs)-min(hs)<1 and all(abs(x-408)<1 for x in hs) and m['map']['b']<=m['svg']['b']+1 and m['legend']['b']<=m['panels'][1]['b'] and m['font']<=11.5 and m['inset']['oy'] in ('auto','scroll')
        results.append(m); (out/f'metrics_{w}x{h}.json').write_text(json.dumps(m,indent=2)); page.eval_on_selector('.app-inset','e=>e.scrollTop=e.scrollHeight'); page.screenshot(path=str(out/f'home_{w}x{h}.png')); page.close()
    browser.close()
errs=[f"{x['v']['w']}x{x['v']['h']}" for x in results if not x['ok']]
(out/'summary.json').write_text(json.dumps({'result':'PASS' if not errs else 'FAIL','errors':errs,'metrics':results},indent=2))
if errs: print('FAIL '+', '.join(errs),file=sys.stderr); raise SystemExit(1)
print(f'VALIDAÇÃO PORTFÓLIO V4.6: PASS — {len(results)} viewports, incluindo alturas <650px')
for x in results: print(f"{x['v']['w']}x{x['v']['h']}: panels={x['panels'][0]['h']:.0f}px rows={len(x['rows'])} portfolioScroll={x['psh']}/{x['pc']} map={x['map']['w']:.0f}x{x['map']['h']:.0f} page={x['inset']['s']}/{x['inset']['c']}")
