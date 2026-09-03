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

const PREFERRED_LEGEND_ORDER = ["RJ", "SP", "CE", "RN", "MT", "RO"];

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
type ProjectedMarker = Shopping & { x: number; y: number; color: string };

function hasValidCoordinates(shopping: Shopping) {
  return (
    Number.isFinite(shopping.latitude) &&
    Number.isFinite(shopping.longitude) &&
    shopping.latitude >= BRAZIL_MAP_BOUNDS.minLat &&
    shopping.latitude <= BRAZIL_MAP_BOUNDS.maxLat &&
    shopping.longitude >= BRAZIL_MAP_BOUNDS.minLng &&
    shopping.longitude <= BRAZIL_MAP_BOUNDS.maxLng
  );
}

function distance(a: ProjectedMarker, b: ProjectedMarker) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Mantém cada shopping na posição geográfica real. Quando duas unidades da mesma
// região ficariam praticamente sobrepostas no mapa nacional, aplica apenas um
// deslocamento visual mínimo em torno do ponto geográfico original.
function makeMarkers(items: Shopping[]): Marker[] {
  const projected: ProjectedMarker[] = items
    .filter(hasValidCoordinates)
    .map((shopping) => {
      const point = project(shopping.latitude, shopping.longitude);
      return {
        ...shopping,
        x: point.x,
        y: point.y,
        color: STATE_COLOR[shopping.stateCode] ?? "var(--accent-cyan)",
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code, "pt-BR"));

  const visited = new Set<string>();
  const markers: Marker[] = [];

  for (const base of projected) {
    if (visited.has(base.id)) continue;

    const cluster = projected.filter(
      (candidate) =>
        !visited.has(candidate.id) &&
        candidate.stateCode === base.stateCode &&
        distance(base, candidate) < 9,
    );

    cluster.forEach((item) => visited.add(item.id));

    if (cluster.length === 1) {
      markers.push({
        ...base,
        markerX: clampMarker(base.x, 10, BRAZIL_MAP_WIDTH - 10),
        markerY: clampMarker(base.y, 10, BRAZIL_MAP_HEIGHT - 10),
      });
      continue;
    }

    const centerX = cluster.reduce((sum, item) => sum + item.x, 0) / cluster.length;
    const centerY = cluster.reduce((sum, item) => sum + item.y, 0) / cluster.length;
    const radius = cluster.length <= 2 ? 3.8 : 5.2;

    cluster.forEach((item, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / cluster.length;
      markers.push({
        ...item,
        markerX: clampMarker(centerX + Math.cos(angle) * radius, 10, BRAZIL_MAP_WIDTH - 10),
        markerY: clampMarker(centerY + Math.sin(angle) * radius, 10, BRAZIL_MAP_HEIGHT - 10),
      });
    });
  }

  return markers;
}

export function BrazilMap({ items = [] }: { items?: Shopping[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const value: Record<string, Shopping[]> = {};
    items.forEach((shopping) => {
      if (!shopping.stateCode || shopping.stateCode === "--") return;
      value[shopping.stateCode] = value[shopping.stateCode] ?? [];
      value[shopping.stateCode].push(shopping);
    });
    return value;
  }, [items]);

  const legendOrder = useMemo(() => {
    const states = Object.keys(grouped);
    return [
      ...PREFERRED_LEGEND_ORDER.filter((state) => states.includes(state)),
      ...states
        .filter((state) => !PREFERRED_LEGEND_ORDER.includes(state))
        .sort((a, b) => a.localeCompare(b, "pt-BR")),
    ];
  }, [grouped]);

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
    <div className="portfolio-map-root relative flex min-h-0 w-full flex-1 flex-col">
      <svg
        viewBox={`0 0 ${BRAZIL_MAP_WIDTH} ${BRAZIL_MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="portfolio-map-svg min-h-0 w-full flex-1 overflow-visible"
        role="img"
        aria-label="Distribuição dos shoppings no Brasil"
        onMouseLeave={() => setHoveredId(null)}
      >
        <defs>
          <radialGradient id="brazil-map-fill" cx="62%" cy="42%" r="72%">
            <stop offset="0%" stopColor="var(--map-fill-start)" stopOpacity="0.9" />
            <stop offset="68%" stopColor="var(--map-fill-mid)" stopOpacity="0.94" />
            <stop offset="100%" stopColor="var(--map-fill-end)" stopOpacity="0.98" />
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
          stroke="var(--map-outline)"
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
              stroke="var(--map-state-line)"
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
                stroke="var(--map-marker-ring)"
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
              fill="var(--popover)"
              stroke="var(--border)"
              strokeWidth={0.8}
              filter="url(#map-shadow)"
            />
            <circle cx={13} cy={15} r={3.2} fill={hovered.color} />
            <text x={22} y={18} fill="var(--popover-foreground)" fontSize={11} fontWeight={700}>
              {hovered.code}
            </text>
            <text x={12} y={34} fill="var(--muted-foreground)" fontSize={9.5}>
              {hovered.city}/{hovered.stateCode}
            </text>
          </g>
        )}
      </svg>

      <div className="portfolio-map-legend mt-2 grid grid-cols-3 gap-x-3 gap-y-1.5 text-[10px] text-muted-foreground">
        {legendOrder.map((uf) => (
          <div key={uf} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
              style={{
                color: STATE_COLOR[uf] ?? "var(--accent-cyan)",
                background: "currentColor",
              }}
            />
            <span>
              {uf} ({grouped[uf]?.length ?? 0})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
