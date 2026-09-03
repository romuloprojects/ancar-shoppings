from playwright.sync_api import sync_playwright
from pathlib import Path
import json

root = Path.cwd()
css = (root / 'src/styles.css').read_text(encoding='utf-8')
html = '''<!doctype html><html><head><meta charset="utf-8"><style>
:root{--primary:#10d5d4;--border:#243449;--background:#071426;--foreground:#eef5ff;--muted-foreground:#8f9bad}
*{box-sizing:border-box}body{margin:0;background:#061323;color:var(--foreground);font-family:Arial,sans-serif}.shell{margin-left:80px;padding:24px;max-width:none}.panel{border:1px solid var(--border);border-radius:16px;background:#0a1728}button{height:34px;border:0;border-radius:9px;padding:0 14px;background:#12d7d2;color:#001a20;font-weight:700;white-space:nowrap}
''' + css + '''</style></head><body><main class="shell compact-reports-page">
<div class="reports-control-strip panel"><label>Shopping<select><option>GOL · Golden Square Shopping</option></select></label><div class="reports-base-status">Base desde 01/09/2026</div></div>
<div class="report-generator-grid" style="margin-top:14px">
<section class="panel report-generator-card"><div class="report-generator-head"><div class="report-generator-icon">◫</div><div class="report-generator-copy"><h3>Relatório diário</h3><p>Consolidação de um dia completo, com leitura hora a hora.</p></div></div><div class="report-generator-actions"><div class="report-generator-control"><input value="02/09/2026"></div><button>Baixar PDF</button></div></section>
<section class="panel report-generator-card"><div class="report-generator-head"><div class="report-generator-icon">◫</div><div class="report-generator-copy"><h3>Relatório semanal</h3><p>Sete dias completos encerrando na data selecionada.</p></div></div><div class="report-generator-actions"><div class="report-generator-control"><input value="02/09/2026"></div><button>Baixar PDF</button></div></section>
<section class="panel report-generator-card"><div class="report-generator-head"><div class="report-generator-icon">◫</div><div class="report-generator-copy"><h3>Relatório mensal</h3><p>Mês fechado do shopping, incluindo meses históricos já consolidados.</p></div></div><div class="report-generator-actions"><div class="report-generator-control"><select><option>Agosto de 2026 · 31 dias com dados</option></select><div class="report-history-note">Até os 6 meses fechados mais recentes existentes na base.</div></div><button>Baixar PDF</button></div></section>
<section class="panel report-generator-card"><div class="report-generator-head"><div class="report-generator-icon">◫</div><div class="report-generator-copy"><h3>Mensal · Portfólio ANCAR</h3><p>Consolidado executivo do portfólio, com rankings e métricas normalizadas por área.</p></div></div><div class="report-generator-actions"><div class="report-generator-control"><select><option>Agosto de 2026 · 13 shoppings com dados</option></select><div class="report-history-note">Até os 6 meses fechados mais recentes existentes no portfólio.</div></div><button>Baixar PDF</button></div></section>
</div></main></body></html>'''

viewports = [(1920,1080),(1792,862),(1524,722),(1366,768),(1024,650)]
results=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for w,h in viewports:
        page=browser.new_page(viewport={'width':w,'height':h})
        page.set_content(html, wait_until='load')
        data=page.evaluate('''() => {
          const cards=[...document.querySelectorAll('.report-generator-card')];
          const inside=(child,parent)=>child.left>=parent.left-1&&child.right<=parent.right+1&&child.top>=parent.top-1&&child.bottom<=parent.bottom+1;
          const rect=e=>e.getBoundingClientRect();
          let failures=[];
          cards.forEach((card,i)=>{
            const cr=rect(card); const p=rect(card.querySelector('p')); const actions=rect(card.querySelector('.report-generator-actions')); const btn=rect(card.querySelector('button')); const ctrl=rect(card.querySelector('.report-generator-control'));
            if(!inside(p,cr)) failures.push(`card ${i+1}: description outside`);
            if(!inside(actions,cr)) failures.push(`card ${i+1}: actions outside`);
            if(btn.left < ctrl.right-1 && btn.top < ctrl.bottom-1 && btn.bottom > ctrl.top+1) failures.push(`card ${i+1}: button/control overlap`);
          });
          const body=document.body.getBoundingClientRect();
          return {failures,scrollW:document.documentElement.scrollWidth,innerW:innerWidth,bodyH:body.height,gridCols:getComputedStyle(document.querySelector('.report-generator-grid')).gridTemplateColumns};
        }''')
        ok=not data['failures'] and data['scrollW']<=w+1
        results.append({'viewport':f'{w}x{h}','ok':ok,**data})
        page.close()
    browser.close()

print(json.dumps(results,ensure_ascii=False,indent=2))
failed=[r for r in results if not r['ok']]
if failed:
    raise SystemExit(1)
print(f'VALIDAÇÃO RELATÓRIOS V5.4: PASS — {len(results)} viewports, sem sobreposição')
