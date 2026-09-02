from pathlib import Path
import re, json
from playwright.sync_api import sync_playwright

src=Path('/mnt/data/ancar_recovery/v38_app/src/data/brazilMapPaths.ts').read_text()
path=re.search(r'export const BRAZIL_OUTLINE_PATH =\s*\n\s*"([^"]+)";',src).group(1)
html=f'''<!doctype html><html><head><style>
*{{box-sizing:border-box}} html,body{{margin:0;width:100%;height:100%;font-family:Arial;background:#061323;color:#eef4ff;overflow:hidden}}
.top{{height:64px;border-bottom:1px solid #1b2a3d;background:#07101f}}
.side{{position:absolute;left:0;top:64px;bottom:0;width:68px;border-right:1px solid #1b2a3d;background:#07101f}}
.main{{position:absolute;left:68px;right:0;top:64px;bottom:0;padding:20px 24px}}
.overview{{height:100%;display:grid;grid-template-rows:108px minmax(285px,1fr) 320px;gap:12px;overflow:hidden}}
.row1{{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}}
.kpi,.panel{{border:1px solid #19304a;border-radius:14px;background:#0a1728;overflow:hidden}}
.kpi{{padding:16px}}
.mid{{display:grid;grid-template-columns:1fr 1fr;gap:12px;min-height:0}}
.mid .panel{{padding:14px}}
.lower{{display:grid;grid-template-columns:5fr 3fr 2fr 2fr;gap:12px;min-height:0}}
.lower>.panel{{height:100%;min-height:0;padding:12px}}
.portfolio{{display:flex;flex-direction:column}} .cards{{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;flex:1}} .mini{{border:1px solid #1b314a;border-radius:12px;padding:10px}}
.map-panel{{display:flex;flex-direction:column}}
.map-title{{height:20px;flex:none;font-weight:700}}
.map-body{{display:flex;flex:1 1 auto;min-height:0;flex-direction:column}}
.map-svg{{display:block;flex:1 1 auto;min-height:0;width:100%;height:100%;max-height:none}}
.legend{{flex:none;height:34px;display:grid;grid-template-columns:repeat(3,1fr);font-size:10px;padding-top:6px}}
.insights{{display:flex;flex-direction:column}}
.health{{display:flex;flex-direction:column;align-items:stretch}}
.gauge-wrap{{display:flex;flex-direction:column;align-items:center;margin-top:4px}}
.gauge{{width:56px;height:56px;border-radius:50%;border:5px solid #24df93;display:grid;place-items:center}}
.gauge-num{{font-size:11px;font-weight:700;line-height:1}}
.health-row{{height:30px;border:1px solid #1a2b3e;border-radius:8px;margin-top:5px;padding:6px 8px;font-size:10px}}
.h2{{font-size:14px;font-weight:700;margin-bottom:8px}}
.chart{{height:calc(100% - 28px);border-top:1px dashed #23405d;margin-top:8px}}
@media(max-height:819px){{.overview{{grid-template-rows:96px minmax(235px,1fr) 260px}}}}
@media(min-height:861px){{.overview{{grid-template-rows:116px minmax(320px,1fr) 330px}}}}
</style></head><body>
<div class="top"></div><div class="side"></div><main class="main"><div class="overview">
<div class="row1">{''.join('<div class="kpi"><b>KPI</b></div>' for _ in range(5))}</div>
<div class="mid"><div class="panel"><div class="h2">Comportamento da CAG</div><div class="chart"></div></div><div class="panel"><div class="h2">Ranking dos Shoppings</div><div class="chart"></div></div></div>
<div class="lower">
<section class="panel portfolio"><div class="h2">Visão do Portfólio</div><div class="cards">{''.join('<div class="mini">Shopping</div>' for _ in range(3))}</div></section>
<section class="panel map-panel"><div class="map-title">Mapa / Distribuição</div><div class="map-body"><svg class="map-svg" viewBox="0 0 420 360" preserveAspectRatio="xMidYMid meet"><path d="{path}" fill="#0b263b" stroke="#24a5c7" stroke-width="1.2"/></svg><div class="legend"><span>RJ (4)</span><span>SP (3)</span><span>CE (0)</span></div></div></section>
<section class="panel insights"><div class="h2">Oportunidades / Insights</div><div class="mini">6 shopping(s) com parâmetros...</div></section>
<section class="panel health"><div class="h2">Qualidade dos Dados</div><div class="gauge-wrap"><div class="gauge"><span class="gauge-num">99</span></div><div style="font-size:8px;color:#2ee995;margin-top:3px">Acompanhar</div></div><div class="health-row">Pontos OK</div><div class="health-row">Shoppings online</div><div class="health-row">Dados desatualizados</div></section>
</div></div></main></body></html>'''

out=Path.cwd()/'validation'/'overview-layout'; out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for w,h in [(1791,857),(1366,768),(1920,1080)]:
        pg=browser.new_page(viewport={'width':w,'height':h})
        pg.set_content(html)
        metrics=pg.evaluate('''() => { const q=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}}; return {overview:q('.overview'),mid:q('.mid'),lower:q('.lower'),mapPanel:q('.map-panel'),mapBody:q('.map-body'),mapSvg:q('.map-svg'),legend:q('.legend'),health:q('.health'),gauge:q('.gauge')}; }''')
        (out/f'metrics_{w}x{h}.json').write_text(json.dumps(metrics,indent=2))
        pg.screenshot(path=str(out/f'home_{w}x{h}.png'))
        pg.close()
    browser.close()

# Critérios mínimos da V3.9
expected={(1791,857):320,(1366,768):260,(1920,1080):330}
for w,h in [(1791,857),(1366,768),(1920,1080)]:
    m=json.loads((out/f'metrics_{w}x{h}.json').read_text())
    assert m['lower']['h'] >= expected[(w,h)]-1, f'Faixa inferior insuficiente em {w}x{h}: {m["lower"]["h"]}'
    assert m['mapSvg']['bottom'] <= m['legend']['y']+1, f'Mapa invade legenda em {w}x{h}'
    assert m['legend']['bottom'] <= m['mapPanel']['bottom']-10, f'Legenda cortada em {w}x{h}'
    assert m['gauge']['w'] <= 56 and m['gauge']['h'] <= 56, f'Gauge grande em {w}x{h}'
print('VALIDAÇÃO GEOMÉTRICA DA VISÃO GERAL: PASS')
print(out)
