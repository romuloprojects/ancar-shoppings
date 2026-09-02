from pathlib import Path
import re, json
from playwright.sync_api import sync_playwright

root = Path.cwd()
src = (root / 'src/data/brazilMapPaths.ts').read_text()
path = re.search(r'export const BRAZIL_OUTLINE_PATH =\s*\n\s*"([^"]+)";', src).group(1)

cards=''.join(f'''<div class="shopping-card"><i></i><div class="sc-head"><b>{c}</b><span>●</span></div><small>Rio de Janeiro/RJ</small><div class="metrics"><strong>{v}</strong><strong>—</strong><strong>{q}</strong></div><div class="labels"><span>kW</span><span>kW/TR</span><span>%</span></div></div>''' for c,v,q in [('BLD','0','92'),('BAN','23,5','90'),('BPS','0','100'),('CVS','10','98'),('GOL','38','100'),('ITA','0','100')])
insights=''.join(f'<div class="insight"><b>{x}</b><small>Prioridade do portfólio</small></div>' for x in ['Parâmetros pendentes','Periféricos em atenção','Qualidade de dados'])
html=f'''<!doctype html><html><head><meta charset="utf-8"><style>
*{{box-sizing:border-box}}html,body{{margin:0;width:100%;height:100%;background:#061323;color:#eef4ff;font-family:Arial,sans-serif;overflow:hidden}}header{{height:64px;background:#07101f;border-bottom:1px solid #1b2a3d}}.side{{position:absolute;left:0;top:64px;bottom:0;width:68px;background:#07101f;border-right:1px solid #1b2a3d}}.main{{position:absolute;left:68px;right:0;top:64px;bottom:0;padding:20px 24px}}.overview{{height:100%;display:grid;grid-template-rows:var(--kpi,84px) minmax(150px,1fr) auto;gap:8px;overflow:hidden}}.row1{{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}}.kpi,.panel{{background:#0a1728;border:1px solid #19304a;border-radius:14px;overflow:hidden}}.mid{{display:grid;grid-template-columns:1fr 1fr;gap:12px;min-height:0}}.lower{{display:grid;grid-template-columns:5fr 3fr 2fr 2fr;gap:12px;min-height:0;align-items:stretch}}.panel{{padding:10px}}.portfolio{{height:auto;display:flex;flex-direction:column}}.title{{height:22px;display:flex;align-items:center;justify-content:space-between;font-weight:700;font-size:13px;margin-bottom:6px}}.portfolio-cards{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,var(--cardh,116px));gap:var(--cardgap,7px);overflow:visible}}.shopping-card{{height:var(--cardh,116px);min-height:var(--cardh,116px);border:1px solid #17304a;border-radius:12px;padding:10px;background:#091a2e;position:relative;overflow:hidden}}.shopping-card i{{position:absolute;right:10px;top:10px;width:8px;height:8px;border-radius:50%;background:#25e59a}}.sc-head{{display:flex;justify-content:space-between;padding-right:12px}}.sc-head b{{font-size:15px}}.shopping-card small{{display:block;color:#8e9db0;font-size:9px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}.metrics,.labels{{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;text-align:center}}.metrics{{margin-top:15px;font-size:14px}}.labels{{margin-top:3px;font-size:8px;color:#75879a}}.pager{{height:28px;margin-top:8px;display:flex;align-items:center;justify-content:space-between;font-size:9px;color:#8e9db0}}.pager-buttons{{display:flex;gap:4px}}.pager-buttons span{{display:grid;place-items:center;width:24px;height:24px;border:1px solid #1d4158;border-radius:8px}}.map-panel{{display:flex;flex-direction:column}}.map-root{{display:flex;flex:1;min-height:0;flex-direction:column}}.map-svg{{display:block;flex:1 1 0;width:100%;height:100%;min-height:0}}.legend{{display:flex;flex:0 0 22px;min-height:22px;align-items:center;gap:12px;margin-top:2px;overflow:hidden;white-space:nowrap;font-size:9px;color:#8798ab}}.insights{{display:flex;flex-direction:column}}.insight-list{{display:grid;grid-template-rows:repeat(3,1fr);gap:7px;flex:1;min-height:0}}.insight{{border:1px solid #17304a;border-left:2px solid #ffad35;border-radius:12px;padding:10px;overflow:hidden}}.insight b{{font-size:11px;display:block}}.insight small{{font-size:8px;color:#8292a4}}.health{{display:flex;flex-direction:column;align-items:stretch}}.gauge{{width:56px;height:56px;border-radius:50%;border:5px solid #24df93;display:grid;place-items:center;margin:6px auto}}.gauge b{{font-size:11px}}.healthrow{{height:32px;border:1px solid #17304a;border-radius:9px;margin-top:5px;padding:8px;font-size:9px;display:flex;justify-content:space-between}}.footer{{margin-top:auto;height:25px;border:1px solid #17304a;border-radius:8px;font-size:8px;display:grid;place-items:center;color:#8191a2}}
@media(min-height:650px) and (max-height:719px){{.overview{{--kpi:84px;--cardh:116px;--cardgap:7px}}}}
@media(min-height:720px) and (max-height:819px){{.overview{{--kpi:92px;--cardh:126px;--cardgap:8px}}}}
@media(min-height:820px) and (max-height:899px){{.overview{{--kpi:100px;--cardh:136px;--cardgap:9px}}}}
@media(min-height:900px){{.overview{{--kpi:108px;--cardh:146px;--cardgap:10px}}}}
</style></head><body><header></header><aside class="side"></aside><main class="main"><div class="overview"><div class="row1">{''.join('<div class="kpi"></div>' for _ in range(5))}</div><div class="mid"><div class="panel"></div><div class="panel"></div></div><div class="lower"><section class="panel portfolio"><div class="title"><span>Visão do Portfólio (7 Shoppings)</span><span>Ver todos</span></div><div class="portfolio-cards">{cards}</div><div class="pager"><span>Exibindo 1–6 de 7</span><div class="pager-buttons"><span>‹</span><span>1</span><span>2</span><span>›</span></div></div></section><section class="panel map-panel"><div class="title">Mapa / Distribuição</div><div class="map-root"><svg class="map-svg" viewBox="0 0 420 360" preserveAspectRatio="xMidYMid meet"><path id="br" d="{path}" fill="#0b263b" stroke="#24a5c7" stroke-width="1.2"/></svg><div class="legend"><span>RJ (3)</span><span>SP (4)</span></div></div></section><section class="panel insights"><div class="title">Oportunidades / Insights</div><div class="insight-list">{insights}</div></section><section class="panel health"><div class="title">Qualidade dos Dados</div><div class="gauge"><b>98</b></div><div class="healthrow"><span>Pontos OK</span><b>82/84</b></div><div class="healthrow"><span>Shoppings online</span><b>7/7</b></div><div class="healthrow"><span>Desatualizados</span><b>0</b></div><div class="footer">Atualização automática a cada 3 minutos</div></section></div></div></main></body></html>'''

out=root/'validation'/'lower-row-v41'; out.mkdir(parents=True,exist_ok=True)
viewports=[(1280,680),(1366,768),(1536,760),(1792,860),(1902,892),(1920,1080)]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for w,h in viewports:
        page=browser.new_page(viewport={'width':w,'height':h})
        page.set_content(html)
        metrics=page.evaluate('''() => { const q=s=>document.querySelector(s), rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right}}; const cards=[...document.querySelectorAll('.shopping-card')]; const panels=[...document.querySelectorAll('.lower>.panel')]; const p=q('.portfolio'); return {overview:rect(q('.overview')),mid:rect(q('.mid')),lower:rect(q('.lower')),portfolio:rect(p),portfolioClientHeight:p.clientHeight,portfolioScrollHeight:p.scrollHeight,cards:cards.map(rect),panels:panels.map(rect),mapSvg:rect(q('.map-svg')),mapPath:rect(q('#br')),legend:rect(q('.legend')),gauge:rect(q('.gauge'))}; }''')
        metrics['allSixCardsInside']=all(c['bottom'] <= metrics['portfolio']['bottom']-30+1 for c in metrics['cards'])
        metrics['equalPanelHeights']=max(p['h'] for p in metrics['panels'])-min(p['h'] for p in metrics['panels']) < 1.5
        metrics['portfolioNoScroll']=metrics['portfolioScrollHeight'] <= metrics['portfolioClientHeight']+1
        (out/f'metrics_{w}x{h}.json').write_text(json.dumps(metrics,indent=2))
        page.screenshot(path=str(out/f'home_{w}x{h}.png'))
        page.close()
    browser.close()
for w,h in viewports:
    m=json.loads((out/f'metrics_{w}x{h}.json').read_text())
    assert m['allSixCardsInside'], f'6 cards não cabem em {w}x{h}'
    assert m['portfolioNoScroll'], f'Portfólio tem scroll em {w}x{h}'
    assert m['equalPanelHeights'], f'Cards inferiores com alturas diferentes em {w}x{h}'
    assert m['mapPath']['bottom'] <= m['mapSvg']['bottom']+1, f'Mapa cortado em {w}x{h}'
    assert m['legend']['bottom'] <= m['panels'][1]['bottom']-8, f'Legenda cortada em {w}x{h}'
    assert m['lower']['bottom'] <= m['overview']['bottom']+1, f'Faixa inferior sai da viewport em {w}x{h}'
print(f'VALIDAÇÃO FAIXA INFERIOR V4.1: PASS — {len(viewports)} viewports')
print(out)
