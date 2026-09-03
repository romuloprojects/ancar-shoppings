from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright

root=Path.cwd(); out=root/'validation'/'kpi-layout-v45'; out.mkdir(parents=True,exist_ok=True)
labels=[
 ('Potência CAG','429,5','kW','-4,2%','vs ontem'),
 ('Produção Térmica','449,7','TR','+3,1%','vs ontem'),
 ('Eficiência da CAG','0,96','kW/TR','-2,8%','vs ontem'),
 ('Chillers Ativos','1 / 4','','-12,5%','vs ontem'),
 ('Periféricos','18,1','kW','+6,3%','vs ontem'),
 ('Temperatura Externa','28,4','°C','+1,2°C','vs ontem'),
]
def card(x):
 label,value,unit,delta,cmp=x
 return f'''<article class="kpi"><div class="inner"><div class="icon">◇</div><div class="content"><div class="label">{label}</div><div class="value"><b>{value}</b><span>{unit}</span></div><div class="comparison"><i>↗</i><strong>{delta}</strong><span>{cmp}</span></div></div></div></article>'''
cards=''.join(card(x) for x in labels)
html=f'''<!doctype html><html><head><meta charset="utf-8"><style>
*{{box-sizing:border-box}}html,body{{margin:0;background:#061323;color:#eef4ff;font-family:Arial,sans-serif}}.shell{{display:flex;width:100vw}}.side{{flex:0 0 68px}}.main{{min-width:0;flex:1;padding:20px 24px}}.row{{height:92px;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.65rem}}.kpi{{height:92px;min-width:0;overflow:hidden;border:1px solid #19304a;border-radius:14px;background:#0a1728;padding:10px}}.inner{{height:100%;display:flex;align-items:center;gap:10px;min-width:0}}.icon{{width:40px;height:40px;flex:none;border:1px solid #1f7890;border-radius:50%;display:grid;place-items:center;color:#39d9f0}}.content{{min-width:0;flex:1}}.label{{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px;line-height:1;font-weight:600}}.value{{margin-top:6px;display:flex;align-items:baseline;gap:5px;min-width:0}}.value b{{font-size:22px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}.value span{{font-size:10px;color:#8d9caf;white-space:nowrap}}.comparison{{margin-top:6px;display:flex;align-items:center;gap:3px;min-width:0;font-size:9px;line-height:1;white-space:nowrap;overflow:hidden}}.comparison i,.comparison strong{{flex:none;color:#39d9f0}}.comparison span{{overflow:hidden;text-overflow:ellipsis;color:#8d9caf}}
</style></head><body><div class="shell"><aside class="side"></aside><main class="main"><div class="row">{cards}</div></main></div></body></html>'''
viewports=[(1024,650),(1152,700),(1280,720),(1366,768),(1524,722),(1792,862),(1905,902),(1920,1080)]
results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for w,h in viewports:
  page=b.new_page(viewport={'width':w,'height':h}); page.set_content(html)
  m=page.evaluate('''() => { const row=document.querySelector('.row'); const cards=[...document.querySelectorAll('.kpi')]; const rect=e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,x:r.x,y:r.y}}; return {count:cards.length,row:rect(row),cards:cards.map(c=>({rect:rect(c),sw:c.scrollWidth,cw:c.clientWidth,sh:c.scrollHeight,ch:c.clientHeight,label:c.querySelector('.label').textContent,comparison:c.querySelector('.comparison').textContent}))}; }''')
  m['ok']=m['count']==6 and abs(m['row']['h']-92)<1 and all(abs(c['rect']['h']-92)<1 and c['sw']<=c['cw']+1 and c['sh']<=c['ch']+1 for c in m['cards'])
  results.append({'viewport':[w,h],**m}); page.screenshot(path=str(out/f'kpis_{w}x{h}.png')); page.close()
 b.close()
errs=[r for r in results if not r['ok']]
(out/'summary.json').write_text(json.dumps({'result':'PASS' if not errs else 'FAIL','results':results},ensure_ascii=False,indent=2))
if errs:
 print('VALIDAÇÃO KPI V4.6: FAIL',file=sys.stderr); print(errs,file=sys.stderr); raise SystemExit(1)
print(f'VALIDAÇÃO KPI V4.6: PASS — {len(results)} viewports, 6 cards, sem overflow')
for r in results: print(f"{r['viewport'][0]}x{r['viewport'][1]}: card={r['cards'][0]['rect']['w']:.1f}x{r['cards'][0]['rect']['h']:.0f}px")
