import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

const locations = read('src/data/shoppingLocations.ts');
const types = read('src/types/live.ts');
const service = read('src/services/liveDashboardService.ts');
const rootRoute = read('src/routes/__root.tsx');
const pkg = JSON.parse(read('package.json'));

assert(locations.includes('NSM:') && locations.includes('Maracanaú'), 'NSM ausente do fallback geográfico do frontend.');
assert(types.includes('powerStatusMismatch?:') && types.includes('status_diagnostics?: LiveStatusDiagnostics'), 'Contrato de diagnóstico potência x status ausente.');
assert(types.includes('kw_cag_raw?:') && types.includes('kw_auxiliares_raw?:'), 'Campos brutos de potência ausentes do contrato.');
assert(service.includes('kpis.alert_flags?.powerStatusMismatch === true'), 'Status do shopping não reage ao alerta potência x status.');
assert(service.includes('Potência detectada com chiller desligado'), 'Alerta visual potência x status ausente.');
assert(service.includes('Periféricos/BAGPS'), 'Descrição do alerta não contempla BAGPS/Periféricos.');
assert(service.includes('equipamentos explicitamente OFF não entram nos KPIs operacionais'), 'Recomendação operacional do alerta ausente.');
assert(pkg.version === '5.7.2', `Versão esperada 5.7.2; encontrada ${pkg.version}.`);
assert(rootRoute.includes('content: "5.7.2"') && rootRoute.includes('ancar-ui=5.7.2'), 'Cache bust/meta da V5.7.2 ausente.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('VALIDAÇÃO NSM + STATUS/POWER FRONTEND V5.7.2: 9/9 PASS');
