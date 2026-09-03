import base64, json
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps, ImageDraw
root=Path.cwd(); contract=root/'validation'/'visual-contract'; out=root/'validation'/'artifacts'; out.mkdir(parents=True,exist_ok=True)
html=(contract/'index.html').read_text(encoding='utf8'); css=(contract/'styles.css').read_text(encoding='utf8'); js=(contract/'app.js').read_text(encoding='utf8')
logo=contract/'assets'/'logo-ancar-white.png'; logo_uri='data:image/png;base64,'+base64.b64encode(logo.read_bytes()).decode() if logo.exists() else ''
html=html.replace('<link rel="stylesheet" href="styles.css" />',f'<style>{css}</style>').replace('<script src="app.js"></script>',f'<script>{js}</script>')
if logo_uri: html=html.replace('assets/logo-ancar-white.png',logo_uri)
pages=['overview','shoppings','detail','ranking','analises','alertas','esg','relatorios','configuracoes']
contract_page={'esg':'energy'}; viewports=[(1920,1080),(1791,857),(1440,900),(1366,768)]
results=[]; failures=[]; shot_paths={}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for w,h in viewports:
        ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=1); pg=ctx.new_page(); pg.set_content(html,wait_until='load')
        for name in pages:
            pg.evaluate('(name)=>showPage(name)',contract_page.get(name,name)); pg.wait_for_timeout(25)
            m=pg.evaluate("""() => { const main=document.querySelector('.main'); const body=document.body; return {bodyW:body.scrollWidth,innerW:innerWidth,mainH:main?.clientHeight||0,mainScrollH:main?.scrollHeight||0}; }""")
            ok=(m['bodyW']<=m['innerW']+1 and m['mainScrollH']<=m['mainH']+2); results.append({'page':name,'viewport':f'{w}x{h}','ok':ok,**m}); failures += [] if ok else [results[-1]]
            if (w,h) in [(1920,1080),(1791,857),(1366,768)]:
                p=out/f'{name}_{w}x{h}.png'; pg.screenshot(path=str(p),full_page=False); shot_paths[(name,w,h)]=p
        ctx.close()
    browser.close()

def contact(w,h):
    thumb_w=620 if w==1920 else 455; thumb_h=round(thumb_w*h/w); pad=18; label_h=24
    sheet=Image.new('RGB',(pad+3*(thumb_w+pad),pad+3*(thumb_h+label_h+pad)),(5,15,27)); draw=ImageDraw.Draw(sheet)
    for i,name in enumerate(pages):
        img=Image.open(shot_paths[(name,w,h)]).convert('RGB').resize((thumb_w,thumb_h))
        row,col=divmod(i,3); x=pad+col*(thumb_w+pad); y=pad+row*(thumb_h+label_h+pad)
        draw.text((x,y),name.upper(),fill=(220,230,240)); sheet.paste(img,(x,y+label_h))
    p=out/f'contact_sheet_{w}x{h}.png'; sheet.save(p); return p
contact(1920,1080); contact(1366,768)
(out/'visual-validation.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
print(f'Páginas/resoluções: {len(results)}'); print(f'Falhas visuais: {len(failures)}')
if failures: print(json.dumps(failures,ensure_ascii=False,indent=2)); raise SystemExit(1)
print('VALIDAÇÃO VISUAL: PASS')
