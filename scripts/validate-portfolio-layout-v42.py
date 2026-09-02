from pathlib import Path
import re, json, sys
from playwright.sync_api import sync_playwright

root = Path.cwd()
styles = (root / 'src/styles.css').read_text()
marker = '/* V4.2 — faixa inferior governada de verdade pelo conteúdo do Portfólio.'
if marker not in styles:
    raise AssertionError('Bloco CSS V4.2 não encontrado em src/styles.css')
v42_css = marker + styles.split(marker, 1)[1]
required = [
    'grid-template-rows: repeat(2, minmax(146px, auto)) !important',
    'overflow-y: auto !important',
    'min-height: 146px !important',
    '.portfolio-health-card .portfolio-health-gauge',
    'font-size: 11px !important',
]
missing = [x for x in required if x not in v42_css]
if missing:
    raise AssertionError('Regras V4.2 ausentes: ' + ', '.join(missing))

src = (root / 'src/data/brazilMapPaths.ts').read_text()
m = re.search(r'export const BRAZIL_OUTLINE_PATH =\s*\n\s*"([^"]+)";', src)
if not m:
    raise AssertionError('Path real do mapa do Brasil não encontrado')
path = m.group(1)

shopping_data = [
    ('BLD','Rio de Janeiro/RJ','0','—','92','Atenção'),
    ('BAN','Campinas/SP','23,6','—','100','Ótimo'),
    ('BPS','Rio de Janeiro/RJ','0','—','100','Ótimo'),
    ('CVS','São José dos Campos/SP','10','—','98','Acompanhar'),
    ('GOL','São Bernardo do Campo/SP','38','—','100','Ótimo'),
    ('ITA','São Paulo/SP','0','—','100','Ótimo'),
]

def card(c, city, p, eff, q, status):
    return f'''<a class="group relative flex shopping-card"><span class="dot"></span><div class="head"><span class="building">▣</span><div><b>{c}</b><small>⌖ {city}</small></div></div><div class="metrics"><div><strong>{p}</strong><em>kW</em><small>Potência</small></div><div><strong>{eff}</strong><em>kW/TR</em><small>kW/TR</small></div><div><strong>{q}</strong><em>%</em><small>Dados</small></div></div><div class="status">{status}</div></a>'''

cards = ''.join(card(*x) for x in shopping_data)
insights = ''.join(f'<div class="insight"><b>{t}</b><small>Prioridade do portfólio</small></div>' for t in ['Parâmetros pendentes','Periféricos em atenção','Qualidade de dados'])

base_css = '''
*{box-sizing:border-box} html,body{margin:0;background:#061323;color:#eef4ff;font-family:Arial,sans-serif} body{min-height:100vh}
.top{height:64px;background:#07101f;border-bottom:1px solid #1b2a3d}.side{position:absolute;left:0;top:64px;width:68px;bottom:0;background:#07101f;border-right:1px solid #1b2a3d}
.dashboard-main{margin-left:68px;padding:20px 24px;min-height:calc(100vh - 64px)}
.overview-dashboard{display:grid;gap:12px}.overview-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.overview-primary-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.overview-portfolio-grid{display:grid}
.kpi,.panel,.overview-health-panel{background:#0a1728;border:1px solid #19304a;border-radius:14px}.panel{overflow:hidden}
.overview-portfolio-panel{display:flex;flex-direction:column}.panel-title{display:flex;align-items:center;justify-content:space-between;min-height:20px;margin-bottom:12px;font-size:13px;font-weight:700}
.overview-portfolio-cards{display:grid}.shopping-card{position:relative;min-height:146px;flex-direction:column;overflow:hidden;border:1px solid #17304a;border-radius:12px;padding:14px 14px 12px;background:#091a2e;color:inherit;text-decoration:none}
.dot{position:absolute;right:12px;top:12px;width:10px;height:10px;border-radius:50%;background:#2be19a;box-shadow:0 0 12px #2be19a}.head{display:flex;align-items:center;gap:10px;padding-right:18px}.building{display:grid;width:40px;height:40px;place-items:center;border:1px solid #164f79;border-radius:50%;color:#27a7ff}.head b{display:block;font-size:16px}.head small{display:block;max-width:125px;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#8e9db0;font-size:10px}
.metrics{display:grid;grid-template-columns:repeat(3,1fr);margin-top:12px;text-align:center}.metrics>div+div{border-left:1px solid #203047}.metrics strong{display:block;font-size:15px;line-height:1}.metrics em{display:block;margin-top:4px;color:#8e9db0;font-size:9px;font-style:normal;text-transform:uppercase}.metrics small{display:block;margin-top:3px;color:#647589;font-size:9px}.status{margin-top:auto;border:1px solid #175b5f;border-radius:6px;padding:4px;text-align:center;color:#25e4be;font-size:10px;font-weight:700}
.mt-3.flex{display:flex;align-items:center;justify-content:space-between;height:28px;margin-top:12px;color:#8e9db0;font-size:10px}.pagerbuttons{display:flex;gap:5px}.pagerbuttons i{display:grid;width:28px;height:28px;place-items:center;border:1px solid #19344e;border-radius:8px;font-style:normal}
.overview-map-panel{display:flex;flex-direction:column}.portfolio-map-root{display:flex;flex:1;min-height:0;flex-direction:column}.portfolio-map-svg{display:block;width:100%}.portfolio-map-legend{display:flex;align-items:center;gap:18px;color:#8e9db0;font-size:9px}
.overview-insights-panel{display:flex;flex-direction:column}.overview-insights-list{display:flex;flex:1;min-height:0;flex-direction:column;gap:8px}.insight{flex:1;border:1px solid #17304a;border-left:2px solid #ffad35;border-radius:12px;padding:10px}.insight b{display:block;font-size:11px}.insight small{color:#8292a4;font-size:8px}
.overview-health-panel{overflow:hidden}.portfolio-health-card{display:flex;flex-direction:column;height:100%}.portfolio-health-gauge{display:grid;place-items:center;border:7px solid #24df93;border-radius:50%;margin-inline:auto}.portfolio-health-gauge .metric-value{font-weight:700}.portfolio-health-label{text-align:center;color:#24df93;font-size:9px;font-weight:bold}.portfolio-health-rows{display:flex;flex-direction:column;gap:8px}.healthrow{display:flex;min-height:34px;align-items:center;justify-content:space-between;border:1px solid #17304a;border-radius:9px;padding:8px;font-size:9px}.portfolio-health-footer{display:grid;min-height:28px;place-items:center;border:1px solid #17304a;border-radius:8px;margin-top:auto;color:#8191a2;font-size:8px}
'''

html = f'''<!doctype html><html><head><meta charset="utf-8"><style>{base_css}\n{v42_css}</style></head><body><div class="top"></div><div class="side"></div><main class="dashboard-main"><div class="overview-dashboard"><div class="overview-kpis">{''.join('<div class="kpi"></div>' for _ in range(5))}</div><div class="overview-primary-grid"><div class="panel"></div><div class="panel"></div></div><div class="overview-portfolio-grid"><section class="panel overview-portfolio-panel"><div class="panel-title"><span>Visão do Portfólio (7 Shoppings)</span><span>Ver todos</span></div><div class="overview-portfolio-cards">{cards}</div><div class="mt-3 flex"><span>Exibindo 1–6 de 7</span><div class="pagerbuttons"><i>‹</i><i>1</i><i>2</i><i>›</i></div></div></section><section class="panel overview-map-panel"><div class="panel-title">Mapa / Distribuição</div><div class="portfolio-map-root"><svg class="portfolio-map-svg" viewBox="0 0 420 360" preserveAspectRatio="xMidYMid meet"><path id="br" d="{path}" fill="#0b263b" stroke="#24a5c7" stroke-width="1.2"/></svg><div class="portfolio-map-legend"><span>● RJ (3)</span><span>● SP (4)</span></div></div></section><section class="panel overview-insights-panel"><div class="panel-title">Oportunidades / Insights</div><div class="overview-insights-list">{insights}</div></section><div class="overview-health-panel"><section class="portfolio-health-card"><div class="panel-title">Qualidade dos Dados</div><div class="portfolio-health-gauge"><span class="metric-value">99</span></div><div class="portfolio-health-label">Dados íntegros</div><div class="portfolio-health-rows"><div class="healthrow"><span>Pontos OK</span><b>83/84</b></div><div class="healthrow"><span>Shoppings online</span><b>7/7</b></div><div class="healthrow"><span>Desatualizados</span><b>0</b></div></div><div class="portfolio-health-footer">Atualização automática a cada 3 minutos</div></section></div></div></div></main></body></html>'''

out = root / 'validation' / 'portfolio-layout-v42'
out.mkdir(parents=True, exist_ok=True)
viewports = [(1280,680),(1366,768),(1434,690),(1536,760),(1792,862),(1902,892),(1920,1080)]
results=[]
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for w,h in viewports:
        page = browser.new_page(viewport={'width':w,'height':h})
        page.set_content(html)
        metrics = page.evaluate('''() => {
          const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
          const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right}};
          const p=q('.overview-portfolio-panel'), cards=qa('.shopping-card'), panels=[q('.overview-portfolio-panel'),q('.overview-map-panel'),q('.overview-insights-panel'),q('.overview-health-panel')];
          const rows=[...new Set(cards.map(c=>Math.round(c.getBoundingClientRect().y)))];
          const mapPanel=q('.overview-map-panel'), health=q('.overview-health-panel');
          return {
            viewport:{w:innerWidth,h:innerHeight}, bodyScrollHeight:document.body.scrollHeight,
            lower:rect(q('.overview-portfolio-grid')), portfolio:rect(p), portfolioClientHeight:p.clientHeight, portfolioScrollHeight:p.scrollHeight,
            cards:cards.map(rect), cardRows:rows, panels:panels.map(rect),
            mapPanel:rect(mapPanel), mapSvg:rect(q('.portfolio-map-svg')), mapPath:rect(q('#br')), legend:rect(q('.portfolio-map-legend')),
            health:rect(health), gauge:rect(q('.portfolio-health-gauge')), gaugeFont:parseFloat(getComputedStyle(q('.portfolio-health-gauge .metric-value')).fontSize)
          };
        }''')
        ph=[x['h'] for x in metrics['panels']]
        metrics['sixVisible']=len(metrics['cards'])==6 and len(metrics['cardRows'])==2
        metrics['noPortfolioScroll']=metrics['portfolioScrollHeight'] <= metrics['portfolioClientHeight']+1
        metrics['equalPanelHeights']=max(ph)-min(ph) < 1.5
        metrics['portfolioTallEnough']=metrics['portfolio']['h'] >= 385
        metrics['mapLargeEnough']=metrics['mapPath']['h'] >= 190 and metrics['mapPath']['w'] >= 220
        metrics['mapInside']=metrics['mapPath']['bottom'] <= metrics['mapSvg']['bottom']+1 and metrics['legend']['bottom'] <= metrics['mapPanel']['bottom']-8
        metrics['qualityMatches']=abs(metrics['health']['h']-metrics['portfolio']['h']) < 1.5 and metrics['gaugeFont'] <= 11.5
        results.append(metrics)
        (out/f'metrics_{w}x{h}.json').write_text(json.dumps(metrics,indent=2))
        page.screenshot(path=str(out/f'home_{w}x{h}.png'), full_page=True)
        page.close()
    browser.close()

errors=[]
for m in results:
    tag=f"{m['viewport']['w']}x{m['viewport']['h']}"
    for key,label in [
        ('sixVisible','6 shoppings em 2 linhas'),('noPortfolioScroll','Portfólio sem scroll interno'),
        ('equalPanelHeights','4 cards inferiores com alturas iguais'),('portfolioTallEnough','Portfólio >=385px'),
        ('mapLargeEnough','mapa ampliado'),('mapInside','mapa e legenda dentro do card'),('qualityMatches','Qualidade proporcional e número pequeno')]:
        if not m[key]: errors.append(f'{tag}: FALHOU {label}')

summary={'result':'PASS' if not errors else 'FAIL','viewports':len(viewports),'errors':errors,'metrics':results}
(out/'summary.json').write_text(json.dumps(summary,indent=2))
if errors:
    print('\n'.join(errors), file=sys.stderr)
    raise SystemExit(1)
print(f"VALIDAÇÃO PORTFÓLIO V4.2: PASS — {len(viewports)} viewports")
for m in results:
    print(f"{m['viewport']['w']}x{m['viewport']['h']}: portfolio={m['portfolio']['h']:.1f}px map={m['mapPath']['w']:.1f}x{m['mapPath']['h']:.1f}px body={m['bodyScrollHeight']}px")
print(out)
