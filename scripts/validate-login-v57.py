import base64, json
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path.cwd(); out=root/'validation'/'login-v57'; out.mkdir(parents=True,exist_ok=True)
css=(root/'public'/'login-v57.css').read_text(encoding='utf8')
logo='data:image/png;base64,'+base64.b64encode((root/'public/images/logo-ancar-v56.png').read_bytes()).decode()
symbol='data:image/png;base64,'+base64.b64encode((root/'public/images/logo-ancar-symbol.png').read_bytes()).decode()
hero='data:image/jpeg;base64,'+base64.b64encode((root/'public/images/ancar-login-mall.jpg').read_bytes()).decode()
icon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'
html=f'''<!doctype html><html><head><meta charset="utf-8"><style>*{{box-sizing:border-box}}html,body{{margin:0;padding:0;width:100%;min-height:100%;font-family:Arial,sans-serif}}{css}.login-v56-hero{{background-image:url("{hero}")!important}}</style></head><body>
<main class="auth-screen login-v56">
<section class="login-v56-hero"><div class="login-v56-hero-shade"></div><div class="login-v56-hero-content">
<header class="login-v56-hero-header"><img src="{symbol}" class="login-v56-symbol"><span class="login-v56-kicker">Plataforma de Gestão ANCAR</span></header>
<div class="login-v56-copy"><h1>Gestão inteligente<br>para o portfólio <em>ANCAR</em></h1><span class="login-v56-accent-line"></span><p>Visão consolidada dos shoppings para decisões estratégicas que impulsionam operação, performance e sustentabilidade.</p></div>
<div class="login-v56-feature-grid"><div class="login-v56-feature"><span class="login-v56-feature-icon">{icon}</span><div><b>Portfólio</b><small>Visão integrada dos ativos e indicadores em um só lugar.</small></div></div><div class="login-v56-feature"><span class="login-v56-feature-icon">{icon}</span><div><b>Performance</b><small>Acompanhamento contínuo para decisões mais assertivas.</small></div></div><div class="login-v56-feature"><span class="login-v56-feature-icon">{icon}</span><div><b>Sustentabilidade</b><small>Eficiência energética e gestão de emissões do portfólio.</small></div></div></div>
</div></section>
<section class="login-v56-access"><div class="login-v56-access-shell"><form class="login-v56-card"><div class="login-v56-brand-block"><img src="{logo}" class="login-v56-brand"><span>Plataforma de Gestão</span></div><div class="login-v56-heading"><h2>Bem-vindo ao Dashboard ANCAR</h2><p>Acesse os indicadores de performance, sustentabilidade e gestão do portfólio de shoppings.</p></div><label class="login-v56-field"><span>Usuário</span><div>{icon}<input placeholder="Digite seu usuário"></div></label><label class="login-v56-field"><span>Senha</span><div>{icon}<input placeholder="Digite sua senha"><button type="button" class="login-v56-eye">{icon}</button></div></label><button class="login-v56-submit"><span>Entrar</span>{icon}</button><div class="login-v56-security">{icon}<span>Sessão segura • 12 horas</span></div></form><footer class="login-v56-footer"><span>Ambiente protegido para usuários autorizados</span><b>Versão 5.7.2</b></footer></div></section>
</main></body></html>'''
viewports=[(1920,1080),(1792,862),(1524,722),(1366,768),(1024,650),(900,700),(390,844)]
results=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for w,h in viewports:
        ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=1)
        pg=ctx.new_page(); pg.set_content(html,wait_until='load'); pg.wait_for_timeout(120)
        m=pg.evaluate('''() => { const main=document.querySelector('.login-v56'); const hero=document.querySelector('.login-v56-hero'); const access=document.querySelector('.login-v56-access'); const card=document.querySelector('.login-v56-card'); const shell=document.querySelector('.login-v56-access-shell'); const r=e=>e?e.getBoundingClientRect():null; return {bodyW:document.body.scrollWidth,bodyH:document.body.scrollHeight,main:r(main),hero:r(hero),access:r(access),card:r(card),shell:r(shell),heroDisplay:getComputedStyle(hero).display,insights:document.querySelectorAll('.login-v56-insights').length}; }''')
        card=m['card']; ok=(m['bodyW']<=w+1 and m['bodyH']<=h+1 and card['left']>=-1 and card['right']<=w+1 and card['top']>=-1 and card['bottom']<=h+1 and m['insights']==0)
        if m['heroDisplay']!='none':
            hr=m['hero']; ok=ok and hr['left']>=-1 and hr['right']<=w+1 and hr['top']>=-1 and hr['bottom']<=h+1
        results.append({'viewport':f'{w}x{h}','ok':ok,**m})
        pg.screenshot(path=str(out/f'login_{w}x{h}.png'),full_page=False)
        ctx.close()
    browser.close()
(out/'summary.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
fail=[x for x in results if not x['ok']]
print(f'Cenários: {len(results)}')
print(f'Falhas: {len(fail)}')
if fail:
    print(json.dumps(fail,ensure_ascii=False,indent=2)); raise SystemExit(1)
print('VALIDAÇÃO LOGIN V5.7: PASS')
