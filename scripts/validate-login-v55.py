import base64, json
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path.cwd(); out=root/'validation'/'login-v55'; out.mkdir(parents=True,exist_ok=True)
css=(root/'src'/'styles.css').read_text(encoding='utf8')
logo_white='data:image/png;base64,'+base64.b64encode((root/'public/images/logo-ancar-white.png').read_bytes()).decode()
logo='data:image/png;base64,'+base64.b64encode((root/'public/images/logo-ancar.png').read_bytes()).decode()
icon='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'
html=f'''<!doctype html><html><head><meta charset="utf-8"><style>*{{box-sizing:border-box}}html,body{{margin:0;padding:0;width:100%;min-height:100%}}{css}</style></head><body>
<main class="auth-screen auth-login-page auth-premium-login">
<section class="auth-brand-panel">
<div class="auth-brand-topline"><img src="{logo_white}" class="auth-logo"><span class="auth-platform-tag">{icon} Energy Intelligence</span></div>
<div class="auth-brand-main"><span class="auth-kicker">Hub de Eficiência Energética</span><h1>Inteligência energética para <em>decisões de alta performance.</em></h1><p>Visibilidade operacional, eficiência, custos e oportunidades das centrais de água gelada do portfólio ANCAR em uma experiência única.</p>
<div class="auth-portfolio-visual"><div class="auth-visual-head"><div><span>Visão operacional</span><b>Performance do portfólio</b></div><span class="auth-live-pill"><i></i> Monitoramento ativo</span></div>
<div class="auth-visual-kpis"><div><span>{icon} Eficiência CAG</span><b>kW/TR</b><small>Metas individualizadas</small></div><div><span>{icon} Energia</span><b>MWh</b><small>Consumo e custos</small></div><div><span>{icon} Portfólio</span><b>Multi-site</b><small>Visão consolidada</small></div></div>
<div class="auth-visual-chart"><div class="auth-chart-labels"><span>Eficiência</span><span>Meta operacional</span></div><svg viewBox="0 0 640 152"><g class="auth-chart-grid"><line x1="8" y1="30" x2="632" y2="30"/><line x1="8" y1="76" x2="632" y2="76"/><line x1="8" y1="122" x2="632" y2="122"/></g><line class="auth-chart-target" x1="8" y1="69" x2="632" y2="69"/><path class="auth-chart-line" d="M8 113 C52 106,74 80,112 88 S170 101,204 75 S265 42,306 57 S370 94,416 78 S489 52,530 64 S590 94,632 54"/><circle class="auth-chart-point" cx="632" cy="54" r="5"/></svg></div></div></div>
<div class="auth-brand-footer"><div>{icon}<span><b>Dados protegidos</b><small>Acesso individual e sessão segura</small></span></div><div>{icon}<span><b>Atualização contínua</b><small>Informações renovadas silenciosamente</small></span></div><div>{icon}<span><b>Análise executiva</b><small>Indicadores técnicos e econômicos</small></span></div></div>
</section>
<section class="auth-form-panel"><div class="auth-form-shell"><img src="{logo}" class="auth-mobile-brand"><form class="auth-card auth-card-premium"><div class="auth-access-badge">{icon} Acesso restrito</div><div class="auth-card-title"><h2>Bem-vindo ao Hub ANCAR</h2><p>Entre com suas credenciais para acessar o ambiente de eficiência energética.</p></div><label class="auth-field auth-field-light"><span>Usuário</span><div>{icon}<input placeholder="Digite seu usuário"></div></label><label class="auth-field auth-field-light"><span>Senha</span><div>{icon}<input placeholder="Digite sua senha"><button class="auth-eye">{icon}</button></div></label><button class="auth-submit auth-submit-premium"><span>Entrar na plataforma</span></button><div class="auth-security-note"><div class="auth-security-icon">{icon}</div><div><b>Ambiente seguro</b><span>Sessão protegida por 12 horas. Senha mínima de 6 caracteres.</span></div></div></form><div class="auth-form-signature">Hub de monitoramento e eficiência energética</div></div></section>
</main></body></html>'''
viewports=[(1920,1080),(1792,862),(1524,722),(1366,768),(1024,650),(900,700),(390,844)]
results=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for w,h in viewports:
        ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=1)
        pg=ctx.new_page(); pg.set_content(html,wait_until='load'); pg.wait_for_timeout(80)
        m=pg.evaluate('''() => { const main=document.querySelector('.auth-login-page'); const brand=document.querySelector('.auth-brand-panel'); const form=document.querySelector('.auth-form-panel'); const card=document.querySelector('.auth-card'); const r=e=>e?e.getBoundingClientRect():null; return {bodyW:document.body.scrollWidth,bodyH:document.body.scrollHeight,main:r(main),brand:r(brand),form:r(form),card:r(card),brandDisplay:getComputedStyle(brand).display}; }''')
        card=m['card']; ok=(m['bodyW']<=w+1 and m['bodyH']<=h+1 and card['left']>=-1 and card['right']<=w+1 and card['top']>=-1 and card['bottom']<=h+1)
        if m['brandDisplay']!='none':
            br=m['brand']; ok=ok and br['left']>=-1 and br['right']<=w+1 and br['top']>=-1 and br['bottom']<=h+1
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
print('VALIDAÇÃO LOGIN V5.5: PASS')
