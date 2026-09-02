from pathlib import Path
import re, json
from playwright.sync_api import sync_playwright

root = Path.cwd()
src = (root / 'src/data/brazilMapPaths.ts').read_text()
path = re.search(r'export const BRAZIL_OUTLINE_PATH =\s*\n\s*"([^"]+)";', src).group(1)

html = f'''<!doctype html><html><head><style>
*{{box-sizing:border-box}}html,body{{margin:0;width:100%;height:100%;background:#061323;color:#eef4ff;font-family:Arial;overflow:hidden}}
header{{height:64px;background:#07101f;border-bottom:1px solid #1b2a3d}}.side{{position:absolute;left:0;top:64px;bottom:0;width:68px;background:#07101f;border-right:1px solid #1b2a3d}}
.main{{position:absolute;left:68px;right:0;top:64px;bottom:0;padding:20px 24px}}.overview{{height:100%;display:grid;grid-template-rows:100px minmax(245px,1fr) 270px;gap:11px;overflow:hidden}}
.row1{{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}}.kpi,.panel{{background:#0a1728;border:1px solid #19304a;border-radius:14px;overflow:hidden}}.mid{{display:grid;grid-template-columns:1fr 1fr;gap:12px;min-height:0}}.lower{{display:grid;grid-template-columns:5fr 3fr 2fr 2fr;gap:12px;min-height:0}}.panel{{padding:10px}}.map-panel{{display:flex;flex-direction:column}}.map-title{{font-weight:700;flex:none;height:20px;margin-bottom:3px}}.map-root{{display:flex;flex:1 1 auto;min-height:0;flex-direction:column}}svg{{display:block;flex:1 1 0;width:100%;height:100%;min-height:0}}.legend{{display:flex;flex:0 0 22px;align-items:center;gap:13px;white-space:nowrap;overflow-x:auto;overflow-y:hidden;font-size:10px;margin-top:2px}}.gauge{{width:56px;height:56px;border-radius:50%;border:5px solid #24df93;display:grid;place-items:center}}.gauge-num{{font-size:11px;font-weight:700}}
@media(min-height:650px) and (max-height:719px){{.overview{{grid-template-rows:84px minmax(170px,1fr) 275px;gap:8px}}}}
@media(min-height:720px) and (max-height:819px){{.overview{{grid-template-rows:92px minmax(200px,1fr) 305px;gap:9px}}}}
@media(min-height:820px) and (max-height:899px){{.overview{{grid-template-rows:100px minmax(235px,1fr) 355px;gap:10px}}}}
@media(min-height:900px){{.overview{{grid-template-rows:108px minmax(255px,1fr) 405px;gap:12px}}}}
</style></head><body><header></header><div class="side"></div><main class="main"><div class="overview">
<div class="row1">{''.join('<div class="kpi"></div>' for _ in range(5))}</div><div class="mid"><div class="panel"></div><div class="panel"></div></div><div class="lower"><div class="panel"></div><div class="panel map-panel"><div class="map-title">Mapa / Distribuição</div><div class="map-root"><svg viewBox="0 0 420 360" preserveAspectRatio="xMidYMid meet"><path id="br" d="{path}" fill="#0b263b" stroke="#24a5c7" stroke-width="1.2"/></svg><div class="legend"><span>RJ (3)</span><span>SP (4)</span><span>CE (0)</span><span>RN (0)</span><span>MT (0)</span><span>RO (0)</span></div></div></div><div class="panel"></div><div class="panel"><div class="gauge"><span class="gauge-num">96</span></div></div></div></div></main></body></html>'''

out = root / 'validation' / 'overview-layout-v4'
out.mkdir(parents=True, exist_ok=True)
viewports = [(1280,650),(1280,680),(1366,768),(1536,760),(1902,892),(1920,1080)]
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for w,h in viewports:
        page = browser.new_page(viewport={'width':w,'height':h})
        page.set_content(html)
        metrics = page.evaluate('''() => { const g=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}}; return {overview:g('.overview'), lower:g('.lower'), mapPanel:g('.map-panel'), mapSvg:g('svg'), mapPath:g('#br'), legend:g('.legend'), gauge:g('.gauge')}; }''')
        metrics['mapWidthRatio'] = metrics['mapPath']['w'] / metrics['mapPanel']['w']
        metrics['mapHeightRatio'] = metrics['mapPath']['h'] / metrics['mapPanel']['h']
        (out / f'metrics_{w}x{h}.json').write_text(json.dumps(metrics, indent=2))
        page.screenshot(path=str(out / f'home_{w}x{h}.png'))
        page.close()
    browser.close()

minimum_lower = {(1280,650):275,(1280,680):275,(1366,768):305,(1536,760):305,(1902,892):355,(1920,1080):405}
for w,h in viewports:
    m = json.loads((out / f'metrics_{w}x{h}.json').read_text())
    assert m['lower']['h'] >= minimum_lower[(w,h)] - 1, f'Faixa inferior insuficiente em {w}x{h}: {m["lower"]["h"]}'
    assert m['lower']['bottom'] <= m['overview']['bottom'] + 1, f'Faixa inferior ultrapassa viewport em {w}x{h}'
    assert m['mapPath']['bottom'] <= m['mapSvg']['bottom'] + 1, f'Mapa cortado em {w}x{h}'
    assert m['legend']['bottom'] <= m['mapPanel']['bottom'] - 8, f'Legenda cortada em {w}x{h}'
    assert m['mapWidthRatio'] >= 0.65, f'Mapa pequeno demais na largura em {w}x{h}: {m["mapWidthRatio"]:.2f}'
    assert m['mapHeightRatio'] >= 0.69, f'Mapa pequeno demais na altura em {w}x{h}: {m["mapHeightRatio"]:.2f}'
    assert m['gauge']['w'] <= 56, f'Gauge acima de 56px em {w}x{h}'
print(f'VALIDAÇÃO GEOMÉTRICA V4: PASS — {len(viewports)} viewports')
print(out)
