import { useMemo, useState } from "react";
import {
  BRAZIL_MAP_BOUNDS,
  BRAZIL_MAP_HEIGHT,
  BRAZIL_MAP_WIDTH,
  BRAZIL_OUTLINE_PATH,
  BRAZIL_STATE_PATHS,
} from "@/data/brazilMapPaths";
import type { Shopping } from "@/types";

const STATE_COLOR: Record<string, string> = {
  SP: "var(--accent-blue)",
  RJ: "var(--accent-yellow)",
  CE: "var(--accent-green)",
  RN: "var(--accent-purple)",
  MT: "var(--accent-orange)",
  RO: "var(--accent-cyan)",
};

const LEGEND_ORDER = ["RJ", "SP", "CE", "RN", "MT", "RO"];

// Âncoras visuais centralizadas dentro de cada estado/região do mapa.
// Elas preservam a leitura geográfica, mas evitam que pontos próximos à costa
// fiquem sobrepostos ou extrapolem o contorno do Brasil.
const STATE_ANCHORS: Record<string, { x: number; y: number }> = {
  SP: { x: 286, y: 252 },
  RJ: { x: 320, y: 247 },
  CE: { x: 365, y: 107 },
  RN: { x: 392, y: 119 },
  MT: { x: 192, y: 191 },
  RO: { x: 113, y: 139 },
};

const STATE_CLUSTER_OFFSETS: Record<string, { x: number; y: number }[]> = {
  RJ: [
    { x: -9, y: -8 },
    { x: 0, y: -10 },
    { x: 9, y: -7 },
    { x: -9, y: 7 },
    { x: 0, y: 9 },
    { x: 9, y: 6 },
  ],
  SP: [
    { x: -8, y: -7 },
    { x: 7, y: -6 },
    { x: -7, y: 7 },
    { x: 8, y: 7 },
  ],
  CE: [
    { x: -7, y: -7 },
    { x: 7, y: -6 },
    { x: -6, y: 7 },
    { x: 7, y: 7 },
  ],
};

function project(lat: number, lng: number) {
  const x =
    ((lng - BRAZIL_MAP_BOUNDS.minLng) / (BRAZIL_MAP_BOUNDS.maxLng - BRAZIL_MAP_BOUNDS.minLng)) *
    BRAZIL_MAP_WIDTH;
  const y =
    ((BRAZIL_MAP_BOUNDS.maxLat - lat) / (BRAZIL_MAP_BOUNDS.maxLat - BRAZIL_MAP_BOUNDS.minLat)) *
    BRAZIL_MAP_HEIGHT;
  return { x, y };
}

function clampMarker(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type Marker = Shopping & { markerX: number; markerY: number; color: string };

function makeMarkers(items: Shopping[]): Marker[] {
  const byState = new Map<string, Shopping[]>();
  items.forEach((shopping) => {
    const current = byState.get(shopping.stateCode) ?? [];
    current.push(shopping);
    byState.set(shopping.stateCode, current);
  });

  return Array.from(byState.entries()).flatMap(([stateCode, stateItems]) => {
    const sorted = [...stateItems].sort((a, b) => a.code.localeCompare(b.code));
    const anchor = STATE_ANCHORS[stateCode];
    const offsets = STATE_CLUSTER_OFFSETS[stateCode] ?? [{ x: 0, y: 0 }];

    return sorted.map((shopping, index) => {
      const geographicPosition = project(shopping.latitude, shopping.longitude);
      const base = anchor ?? geographicPosition;
      const offset = sorted.length > 1 ? offsets[index % offsets.length] : { x: 0, y: 0 };

      return {
        ...shopping,
        markerX: clampMarker(base.x + offset.x, 14, BRAZIL_MAP_WIDTH - 14),
        markerY: clampMarker(base.y + offset.y, 14, BRAZIL_MAP_HEIGHT - 14),
        color: STATE_COLOR[stateCode] ?? "var(--accent-cyan)",
      };
    });
  });
}

export function BrazilMap({ items = [] }: { items?: Shopping[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const value: Record<string, Shopping[]> = {};
    items.forEach((shopping) => {
      value[shopping.stateCode] = value[shopping.stateCode] ?? [];
      value[shopping.stateCode].push(shopping);
    });
    return value;
  }, [items]);

  const markers = useMemo(() => makeMarkers(items), [items]);
  const hovered = markers.find((marker) => marker.id === hoveredId);

  const tooltipWidth = 168;
  const tooltipHeight = 46;
  const tooltipX = hovered
    ? Math.min(Math.max(hovered.markerX - tooltipWidth / 2, 8), BRAZIL_MAP_WIDTH - tooltipWidth - 8)
    : 0;
  const tooltipY = hovered
    ? hovered.markerY > 64
      ? hovered.markerY - tooltipHeight - 13
      : hovered.markerY + 14
    : 0;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${BRAZIL_MAP_WIDTH} ${BRAZIL_MAP_HEIGHT}`}
        className="max-h-[286px] w-full overflow-visible"
        role="img"
        aria-label="Distribuição dos shoppings no Brasil"
        onMouseLeave={() => setHoveredId(null)}
      >
        <defs>
          <radialGradient id="brazil-map-fill" cx="62%" cy="42%" r="72%">
            <stop offset="0%" stopColor="oklch(0.29 0.07 233)" stopOpacity="0.9" />
            <stop offset="68%" stopColor="oklch(0.225 0.045 250)" stopOpacity="0.94" />
            <stop offset="100%" stopColor="oklch(0.185 0.032 260)" stopOpacity="0.98" />
          </radialGradient>
          <filter id="map-marker-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="black" floodOpacity="0.24" />
          </filter>
          <clipPath id="brazil-map-clip">
            <path d={BRAZIL_OUTLINE_PATH} />
          </clipPath>
        </defs>

        <path
          d={BRAZIL_OUTLINE_PATH}
          fill="url(#brazil-map-fill)"
          stroke="oklch(0.62 0.085 220 / 62%)"
          strokeWidth={1.15}
          vectorEffect="non-scaling-stroke"
          filter="url(#map-shadow)"
        />

        <g clipPath="url(#brazil-map-clip)" opacity={0.72}>
          {BRAZIL_STATE_PATHS.map((path) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke="oklch(0.52 0.06 225 / 58%)"
              strokeWidth={0.65}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {markers.map((marker) => {
          const active = marker.id === hoveredId;
          return (
            <g
              key={marker.id}
              className="cursor-pointer outline-none"
              onMouseEnter={() => setHoveredId(marker.id)}
              onFocus={() => setHoveredId(marker.id)}
              onBlur={() => setHoveredId(null)}
              tabIndex={0}
              role="button"
              aria-label={`${marker.code}, ${marker.city}/${marker.stateCode}`}
            >
              <circle
                cx={marker.markerX}
                cy={marker.markerY}
                r={active ? 9.5 : 7.5}
                fill={marker.color}
                opacity={active ? 0.3 : 0.18}
                filter="url(#map-marker-glow)"
              />
              <circle
                cx={marker.markerX}
                cy={marker.markerY}
                r={active ? 4.5 : 3.5}
                fill={marker.color}
                stroke="oklch(0.98 0.01 240 / 70%)"
                strokeWidth={active ? 1.35 : 0.8}
              />
            </g>
          );
        })}

        {hovered && (
          <g transform={`translate(${tooltipX} ${tooltipY})`} pointerEvents="none">
            <rect
              width={tooltipWidth}
              height={tooltipHeight}
              rx={8}
              fill="oklch(0.17 0.035 260 / 96%)"
              stroke="oklch(0.52 0.07 225 / 72%)"
              strokeWidth={0.8}
              filter="url(#map-shadow)"
            />
            <circle cx={13} cy={15} r={3.2} fill={hovered.color} />
            <text x={22} y={18} fill="oklch(0.96 0.01 240)" fontSize={11} fontWeight={700}>
              {hovered.code}
            </text>
            <text x={12} y={34} fill="oklch(0.72 0.02 245)" fontSize={9.5}>
              {hovered.city}/{hovered.stateCode}
            </text>
          </g>
        )}
      </svg>

      <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1.5 text-[10px] text-muted-foreground">
        {LEGEND_ORDER.filter((uf) => grouped[uf]?.length).map((uf) => (
          <div key={uf} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
              style={{
                color: STATE_COLOR[uf] ?? "var(--accent-cyan)",
                background: "currentColor",
              }}
            />
            <span>
              {uf} ({grouped[uf].length})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
