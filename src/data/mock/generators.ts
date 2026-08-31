import type {
  EnergyDataPoint,
  Alert,
  Insight,
  Equipment,
  ESGMetrics,
  PortfolioKpi,
  RankingItem,
} from "@/types";
import { shoppings } from "./shoppings";

// PRNG determinístico para dados estáveis por seed
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function makeDaily(seed: number): EnergyDataPoint[] {
  const rnd = seeded(seed);
  const points: EnergyDataPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const time = `${h.toString().padStart(2, "0")}:00`;
    // curva parabólica com pico ao meio-dia
    const shape = Math.sin((h / 24) * Math.PI);
    const consumo = +(3 + shape * 11 + rnd() * 1.4).toFixed(2);
    const eficiencia = +(0.55 + (1 - shape) * 0.35 + rnd() * 0.04).toFixed(2);
    points.push({ time, eficiencia, consumo });
  }
  return points;
}

export function makeWeekly(seed: number): EnergyDataPoint[] {
  const rnd = seeded(seed + 7);
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  return days.map((d) => ({
    time: d,
    consumo: +(180 + rnd() * 80).toFixed(1),
    eficiencia: +(0.6 + rnd() * 0.3).toFixed(2),
  }));
}

export function makeMonthly(seed: number): EnergyDataPoint[] {
  const rnd = seeded(seed + 30);
  return Array.from({ length: 30 }, (_, i) => ({
    time: `${i + 1}`.padStart(2, "0"),
    consumo: +(150 + rnd() * 90).toFixed(1),
    eficiencia: +(0.6 + rnd() * 0.35).toFixed(2),
  }));
}

export function computePortfolioKpi(): PortfolioKpi {
  const totalPower = shoppings.reduce((s, x) => s + x.powerKW, 0) / 1000;
  const totalCons = shoppings.reduce((s, x) => s + x.consumptionMWh, 0);
  const avgEff = shoppings.reduce((s, x) => s + x.efficiencyKWTR, 0) / shoppings.length;
  const co2 = shoppings.reduce((s, x) => s + (x.emissionsTons ?? 0), 0);
  const eco = shoppings.reduce((s, x) => s + (x.savingsBRL ?? 0), 0);
  return {
    potenciaTotalMW: +totalPower.toFixed(1),
    consumoHojeMWh: Math.round(totalCons * 1.2),
    eficienciaMediaKWTR: +avgEff.toFixed(2),
    co2EvitadoT: +co2.toFixed(1),
    economiaEstimadaBRL: Math.round(eco / 1000),
    deltaPotencia: 4.1,
    deltaConsumo: -3.6,
    deltaEficiencia: -3.2,
    deltaCO2: 7.6,
    deltaEconomia: 6.2,
  };
}

export function makePortfolioSeries(): EnergyDataPoint[] {
  const rnd = seeded(101);
  const points: EnergyDataPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const time = `${h.toString().padStart(2, "0")}:00`;
    const shape = Math.sin((h / 24) * Math.PI);
    points.push({
      time,
      consumo: +(4 + shape * 10 + rnd() * 1.2).toFixed(2),
      eficiencia: +(0.55 + (1 - shape) * 0.4 + rnd() * 0.03).toFixed(2),
    });
  }
  return points;
}

export function makeRanking(
  metric:
    | "eficiencia"
    | "consumo"
    | "economia"
    | "esg"
    | "qualidade"
    | "alertas"
    | "disponibilidade" = "eficiencia",
): RankingItem[] {
  const rnd = seeded(metric.length * 13);
  const list = [...shoppings].map((s) => {
    let value = 0;
    let unit = "";
    switch (metric) {
      case "eficiencia":
        value = s.efficiencyKWTR;
        unit = "kW/TR";
        break;
      case "consumo":
        value = s.consumptionMWh;
        unit = "MWh";
        break;
      case "economia":
        value = (s.savingsBRL ?? 0) / 1000;
        unit = "R$ mil";
        break;
      case "esg":
        value = s.esgScore;
        unit = "pts";
        break;
      case "qualidade":
        value = s.dataAvailability.coveragePct;
        unit = "%";
        break;
      case "alertas":
        value = Math.floor(rnd() * 12);
        unit = "";
        break;
      case "disponibilidade":
        value = s.dataAvailability.coveragePct;
        unit = "%";
        break;
    }
    return { s, value, unit };
  });
  const asc = metric === "eficiencia" || metric === "consumo" || metric === "alertas";
  list.sort((a, b) => (asc ? a.value - b.value : b.value - a.value));
  return list.map((x, i) => ({
    position: i + 1,
    shoppingId: x.s.id,
    code: x.s.code,
    name: x.s.name,
    value: +x.value.toFixed(2),
    unit: x.unit,
    trend: +((rnd() - 0.5) * 10).toFixed(1),
    status: x.s.status,
  }));
}

const alertTemplates = [
  {
    equipment: "Chiller 02",
    title: "Delta T abaixo da meta",
    description: "Delta T operando em 3,8 °C nas últimas 4 horas.",
    recommendation: "Verificar vazão do circuito primário e válvula de balanceamento.",
  },
  {
    equipment: "Periféricos",
    title: "Consumo acima do esperado",
    description: "Consumo 18% acima do baseline nas últimas 24h.",
    recommendation: "Revisar setpoints e cronograma de operação.",
  },
  {
    equipment: "Torre 01",
    title: "Aproximação elevada",
    description: "Aproximação superior a 6 °C.",
    recommendation: "Inspecionar enchimento e distribuição de água.",
  },
  {
    equipment: "Bomba CAP-02",
    title: "Falha de comunicação",
    description: "Sensor sem leitura há 12 minutos.",
    recommendation: "Validar rede Modbus e alimentação do gateway.",
  },
  {
    equipment: "AHU Piso L2",
    title: "Temperatura fora da faixa",
    description: "Insuflamento a 15,8 °C, meta 12 °C.",
    recommendation: "Verificar válvula de água gelada.",
  },
];

export function makeAlerts(shoppingId?: string): Alert[] {
  const rnd = seeded(shoppingId ? shoppingId.length * 31 : 42);
  const sevs: Alert["severity"][] = ["informativo", "atencao", "critico"];
  const stats: Alert["status"][] = ["novo", "em_analise", "reconhecido", "resolvido"];
  const pool = shoppingId ? shoppings.filter((s) => s.id === shoppingId) : shoppings;
  const list: Alert[] = [];
  const count = shoppingId ? 6 : 24;
  for (let i = 0; i < count; i++) {
    const s = pool[Math.floor(rnd() * pool.length)];
    const t = alertTemplates[Math.floor(rnd() * alertTemplates.length)];
    const daysAgo = Math.floor(rnd() * 10);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    list.push({
      id: `alert-${i}-${s.id}`,
      shoppingId: s.id,
      shoppingCode: s.code,
      shoppingName: s.name,
      equipment: t.equipment,
      severity: sevs[Math.floor(rnd() * sevs.length)],
      status: stats[Math.floor(rnd() * stats.length)],
      date: d.toISOString(),
      title: t.title,
      description: t.description,
      recommendation: t.recommendation,
    });
  }
  return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function makeInsights(): Insight[] {
  return [
    {
      id: "i1",
      type: "alerta",
      icon: "warning",
      title: "Delta T abaixo da meta em 4 sites",
      subtitle: "Impacta a eficiência do sistema de HVAC.",
    },
    {
      id: "i2",
      type: "oportunidade",
      icon: "settings",
      title: "Periféricos acima do ideal em 3 shoppings",
      subtitle: "Recomenda-se ajuste de setpoints.",
    },
    {
      id: "i3",
      type: "destaque",
      icon: "trend",
      title: "Melhor performance hoje",
      subtitle: "CenterVale Shopping",
      detail: "Eficiência 0,58 kW/TR",
    },
    {
      id: "i4",
      type: "oportunidade",
      icon: "trending-down",
      title: "Maior potencial de economia",
      subtitle: "Porto Velho Shopping",
      detail: "Economia estimada de R$ 31 mil/mês",
    },
  ];
}

export function makeESG(): ESGMetrics {
  return {
    energiaConsumidaMWh: 6800,
    energiaEconomizadaMWh: 720,
    emissoesT: 1240,
    emissoesEvitadasT: 315,
    intensidadeEnergetica: 148,
    esgScore: 87,
    ambiental: 89,
    social: 85,
    governanca: 87,
    metaProgressoPct: 72,
    energiaRenovavelPct: 38,
    aguaM3: 42500,
    residuosT: 186,
  };
}

export function makeEquipments(seed: number): Equipment[] {
  const rnd = seeded(seed);
  const list: Equipment[] = [];
  for (let i = 1; i <= 4; i++) {
    list.push({
      id: `chi-${i}`,
      name: `Chiller ${i.toString().padStart(2, "0")}`,
      type: "chiller",
      powerKW: Math.round(180 + rnd() * 80),
      status: rnd() > 0.85 ? "manutencao" : rnd() > 0.6 ? "standby" : "operando",
      efficiencyKWTR: +(0.55 + rnd() * 0.35).toFixed(2),
      lastMaintenance: "2025-05-14",
    });
  }
  for (let i = 1; i <= 3; i++) {
    list.push({
      id: `tor-${i}`,
      name: `Torre ${i.toString().padStart(2, "0")}`,
      type: "torre",
      powerKW: Math.round(40 + rnd() * 30),
      status: "operando",
    });
    list.push({
      id: `bmb-${i}`,
      name: `Bomba ${i.toString().padStart(2, "0")}`,
      type: "bomba",
      powerKW: Math.round(20 + rnd() * 25),
      status: "operando",
    });
  }
  return list;
}
