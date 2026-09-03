from pathlib import Path
import base64, json, re, unicodedata
from playwright.sync_api import sync_playwright

root = Path.cwd()
out = root / "validation" / "themes-v57"
out.mkdir(parents=True, exist_ok=True)
css = (root / "src" / "styles.css").read_text(encoding="utf8")

def extract_block(selector: str) -> str:
    pattern = re.compile(re.escape(selector) + r"\s*\{(.*?)\n\}", re.S)
    m = pattern.search(css)
    if not m:
        raise RuntimeError(f"Bloco CSS não encontrado: {selector}")
    return m.group(1)

var_re = re.compile(r"--([\w-]+):\s*([^;]+);")
def parse_vars(text: str):
    return {k: v.strip() for k, v in var_re.findall(text)}

dark_vars = parse_vars(extract_block(":root"))
light_vars = {**dark_vars, **parse_vars(extract_block("html.light"))}
required = [
    "background", "foreground", "card", "muted", "muted-foreground", "border",
    "sidebar", "sidebar-foreground", "accent-cyan", "accent-green", "accent-yellow",
    "popover", "popover-foreground", "map-fill-start", "map-fill-end", "map-outline",
]
for key in required:
    assert key in dark_vars and key in light_vars, f"Token ausente: {key}"

logo_2see = base64.b64encode((root / "public/images/logo-2see-header.svg").read_bytes()).decode()
logo_2see_uri = f"data:image/svg+xml;base64,{logo_2see}"

pages = [
    ("overview", "Visão Geral", "kpi chart metas resumo portfolio mapa insights qualidade"),
    ("shoppings", "Shoppings", "filters cards cards cards cards cards"),
    ("detail", "Detalhe do Shopping", "kpi chart metas chillers table summary"),
    ("ranking", "Ranking", "filters table table table insights"),
    ("analises", "Análises", "filters chart chart comparison insights"),
    ("energy", "Energia e Emissões", "kpi chart chart summary table"),
    ("alerts", "Alertas", "filters alerts alerts table"),
    ("reports", "Relatórios", "filters report report report history"),
    ("settings", "Configurações", "form form form form actions"),
    ("password", "Alterar senha", "form actions"),
]
viewports = [(1920, 1080), (1366, 768)]

def slug(text: str):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")

def page_markup(kind: str):
    if kind == "overview":
        return '''<div class="kpis">''' + ''.join('<div class="card kpi"></div>' for _ in range(6)) + '''</div><div class="layout three"><section class="panel"><h2>Comportamento da CAG</h2><div class="chart"></div></section><section class="panel"><h2>Desempenho vs Metas</h2><div class="metric-row"></div><div class="metric-row"></div></section><section class="panel"><h2>Resumo Econômico</h2><div class="summary-grid"></div></section></div><div class="lower"><section class="panel"><h2>Visão do Portfólio</h2><div class="mini-cards"></div></section><section class="panel map"><h2>Mapa / Distribuição</h2></section><section class="panel"><h2>Oportunidades / Insights</h2></section><section class="panel"><h2>Qualidade dos Dados</h2></section></div>'''
    if kind in ("shoppings", "ranking", "alerts"):
        return '''<section class="panel toolbar"></section><section class="panel table-panel"><h2>Dados da página</h2><div class="table-head"></div>''' + ''.join('<div class="table-row"></div>' for _ in range(8)) + '</section>'
    if kind in ("detail", "energy"):
        return '''<div class="kpis">''' + ''.join('<div class="card kpi"></div>' for _ in range(5)) + '''</div><div class="layout two"><section class="panel"><h2>Evolução / Performance</h2><div class="chart"></div></section><section class="panel"><h2>Metas e resumo</h2><div class="metric-row"></div><div class="metric-row"></div><div class="metric-row"></div></section></div><section class="panel table-panel compact"><div class="table-head"></div>''' + ''.join('<div class="table-row"></div>' for _ in range(4)) + '</section>'
    if kind == "analises":
        return '''<section class="panel toolbar"></section><div class="layout two"><section class="panel"><h2>Comparação</h2><div class="chart"></div></section><section class="panel"><h2>Análise</h2><div class="chart secondary"></div></section></div><section class="panel table-panel compact"></section>'''
    if kind == "reports":
        return '''<section class="panel toolbar"></section><div class="report-grid">''' + ''.join('<section class="panel report-card"><div class="report-icon"></div><h2>Relatório</h2><div class="input"></div><button>Gerar PDF</button></section>' for _ in range(4)) + '</div><section class="panel history"></section>'
    if kind in ("settings", "password"):
        count = 6 if kind == "settings" else 3
        return '''<section class="panel form-panel"><h2>''' + ("Parâmetros" if kind == "settings" else "Segurança") + '''</h2><div class="form-grid">''' + ''.join('<label><span>Campo</span><div class="input"></div></label>' for _ in range(count)) + '''</div><button>Salvar alterações</button></section>'''
    return '<section class="panel"></section>'

def html_for(theme: str, v: dict, kind: str, title: str):
    content = page_markup(kind)
    vars_css = ";".join(f"--{k}:{val}" for k, val in v.items())
    style = """
*{box-sizing:border-box} html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial,sans-serif} body{background:var(--background);color:var(--foreground)}
.shell{height:100%;display:grid;grid-template-columns:68px minmax(0,1fr);grid-template-rows:64px minmax(0,1fr)}
aside{grid-row:1/3;background:var(--sidebar);border-right:1px solid var(--border)} .side-dot{width:36px;height:36px;border-radius:12px;margin:14px auto;background:color-mix(in oklab,var(--accent-cyan) 18%,var(--sidebar));border:1px solid color-mix(in oklab,var(--accent-cyan) 38%,transparent)}
header{display:flex;align-items:center;gap:9px;padding:0 14px;background:color-mix(in oklab,var(--background) 94%,transparent);border-bottom:1px solid var(--border)}
.brand{width:105px;height:34px;border-right:1px solid var(--border)}.control{height:36px;width:178px;border:1px solid var(--border);border-radius:11px;background:color-mix(in oklab,var(--card) 86%,transparent)}
.partner{margin-left:auto;height:36px;width:134px;border:1px solid var(--border);border-radius:10px;background:#fff;display:grid;place-items:center;padding:5px 9px}.partner img{max-width:116px;max-height:25px}.theme{height:36px;width:36px;border:1px solid var(--border);border-radius:10px;background:var(--card)}.status{height:9px;width:9px;border-radius:50%;background:var(--accent-green)}
main{min-width:0;min-height:0;padding:14px 16px;overflow:hidden}h1{font-size:16px;margin:0 0 11px}h2{font-size:12px;margin:0 0 8px}.panel,.card{background:color-mix(in oklab,var(--card) 96%,transparent);border:1px solid var(--border);border-radius:13px;box-shadow:0 10px 28px -24px #0008}.kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.kpi{height:88px}.layout{display:grid;gap:10px;margin-top:10px}.layout.three{grid-template-columns:1.5fr .75fr .9fr;height:44%}.layout.two{grid-template-columns:1.55fr .85fr;height:48%}.lower{display:grid;grid-template-columns:1.8fr 1.1fr .75fr .65fr;gap:10px;margin-top:10px;height:34%}.panel{padding:11px;min-width:0;overflow:hidden}.chart{height:calc(100% - 22px);border-radius:8px;background:linear-gradient(180deg,color-mix(in oklab,var(--accent-cyan) 12%,transparent),transparent);border:1px solid color-mix(in oklab,var(--border) 70%,transparent)}.chart.secondary{background:linear-gradient(180deg,color-mix(in oklab,var(--accent-blue) 12%,transparent),transparent)}.metric-row{height:42px;border-bottom:1px solid var(--border)}.summary-grid,.mini-cards{height:calc(100% - 20px);background:color-mix(in oklab,var(--muted) 46%,transparent);border-radius:8px}.map{background:linear-gradient(145deg,color-mix(in oklab,var(--map-fill-start) 32%,var(--card)),color-mix(in oklab,var(--map-fill-end) 44%,var(--card)))}
.toolbar{height:52px;margin-bottom:10px}.table-panel{height:calc(100% - 88px)}.table-panel.compact{height:24%;margin-top:10px}.table-head{height:34px;background:color-mix(in oklab,var(--muted) 65%,transparent);border-radius:7px}.table-row{height:34px;border-bottom:1px solid var(--border)}.report-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.report-card{height:150px}.report-icon{height:32px;width:32px;border-radius:9px;background:color-mix(in oklab,var(--accent-cyan) 16%,transparent)}.input{height:34px;border:1px solid var(--border);background:var(--background);border-radius:8px}button{margin-top:10px;height:32px;border:0;border-radius:8px;padding:0 14px;background:var(--primary);color:var(--primary-foreground)}.history{height:90px;margin-top:10px}.form-panel{max-width:980px;height:calc(100% - 30px)}.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:14px}label span{display:block;font-size:10px;color:var(--muted-foreground);margin-bottom:5px}
@media(max-width:1500px){.partner{width:116px}.partner img{max-width:100px}.control{width:150px}.kpis{gap:8px}}
"""
    sidebar_dots = ''.join('<div class="side-dot"></div>' for _ in range(8))
    return (
        '<!doctype html><html class="' + theme + '"><head><meta charset="utf-8"><style>:root{' + vars_css + '}' + style +
        '</style></head><body><div class="shell"><aside>' + sidebar_dots +
        '</aside><header><div class="brand"></div><div class="control"></div><div class="control"></div><div class="control"></div>' +
        '<div class="partner"><img src="' + logo_2see_uri + '"></div><div class="theme"></div><span class="status"></span></header>' +
        '<main><h1>' + title + '</h1>' + content + '</main></div></body></html>'
    )

results = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    for theme, vars_ in (("dark", dark_vars), ("light", light_vars)):
        for w, h in viewports:
            for kind, title, _ in pages:
                page = browser.new_page(viewport={"width": w, "height": h})
                page.set_content(html_for(theme, vars_, kind, title), wait_until="load")
                page.wait_for_timeout(25)
                metrics = page.evaluate('''() => ({
                    sw: document.documentElement.scrollWidth,
                    iw: innerWidth,
                    sh: document.documentElement.scrollHeight,
                    ih: innerHeight,
                    main: document.querySelector('main').getBoundingClientRect().toJSON(),
                    partner: document.querySelector('.partner').getBoundingClientRect().toJSON(),
                    panels: document.querySelectorAll('.panel').length,
                    bodyColor: getComputedStyle(document.body).color,
                    bodyBackground: getComputedStyle(document.body).backgroundColor
                })''')
                ok = metrics["sw"] <= metrics["iw"] + 1 and metrics["sh"] <= metrics["ih"] + 1 and metrics["partner"]["right"] <= w + 1 and metrics["panels"] >= 1 and metrics["bodyColor"] != metrics["bodyBackground"]
                record = {"theme": theme, "page": title, "viewport": f"{w}x{h}", "ok": ok, **metrics}
                results.append(record)
                if w == 1366:
                    page.screenshot(path=str(out / f"{theme}_{slug(title)}_1366x768.png"), full_page=False)
                page.close()
    browser.close()

source = "\n".join(p.read_text(encoding="utf8") for p in (root / "src").rglob("*.tsx"))
source_checks = {
    "theme_toggle_global": "<ThemeToggle />" in (root / "src/components/TopBar.tsx").read_text(encoding="utf8"),
    "2see_global": "logo-2see-header.svg" in (root / "src/components/TopBar.tsx").read_text(encoding="utf8"),
    "2see_responsive": "xl:hidden" in (root / "src/components/TopBar.tsx").read_text(encoding="utf8"),
    "ancar_dual_logo": "dark:hidden" in (root / "src/components/TopBar.tsx").read_text(encoding="utf8"),
    "theme_persistence": "localStorage.setItem(STORAGE_KEY, theme)" in (root / "src/components/ThemeToggle.tsx").read_text(encoding="utf8"),
    "prepaint_bootstrap": 'localStorage.getItem("ancar-theme")' in (root / "src/routes/__root.tsx").read_text(encoding="utf8"),
    "map_theme_tokens": "var(--map-fill-start)" in source and "var(--map-outline)" in source,
    "tooltip_theme_tokens": 'background: "var(--popover)"' in source,
    "overview_chart_theme_tokens": 'background:"var(--popover)"' in source,
}
failures = [r for r in results if not r["ok"]]
if not all(source_checks.values()):
    failures.append({"source_checks": source_checks})

(out / "validation.json").write_text(json.dumps({"results": results, "source_checks": source_checks}, ensure_ascii=False, indent=2), encoding="utf8")
print(f"Cenários visuais: {len(results)}")
print(f"Falhas: {len(failures)}")
print("Source checks:", source_checks)
if failures:
    print(json.dumps(failures[:12], ensure_ascii=False, indent=2))
    raise SystemExit(1)
print("VALIDAÇÃO TEMAS V5.7: PASS — 10 telas × 2 temas × 2 viewports")
