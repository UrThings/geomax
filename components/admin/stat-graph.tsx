"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { DailyStat } from "@/lib/data";

type Tone = "primary" | "sky" | "emerald";

const TONES: Record<
  Tone,
  {
    stroke: string;
    glow: string;
    areaTop: string;
    areaBottom: string;
    chip: string;
  }
> = {
  primary: {
    stroke: "#7c3aed",
    glow: "rgba(124, 58, 237, 0.4)",
    areaTop: "rgba(124, 58, 237, 0.28)",
    areaBottom: "rgba(124, 58, 237, 0.02)",
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  sky: {
    stroke: "#0284c7",
    glow: "rgba(2, 132, 199, 0.4)",
    areaTop: "rgba(2, 132, 199, 0.28)",
    areaBottom: "rgba(2, 132, 199, 0.02)",
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  emerald: {
    stroke: "#059669",
    glow: "rgba(5, 150, 105, 0.4)",
    areaTop: "rgba(5, 150, 105, 0.28)",
    areaBottom: "rgba(5, 150, 105, 0.02)",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
};

type Point = { x: number; y: number };

function smoothPath(points: Point[]) {
  if (points.length < 2) {
    if (points.length === 1) return `M${points[0].x},${points[0].y}`;
    return "";
  }
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
  }

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function niceMax(value: number) {
  if (value <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

type StatGraphProps = {
  data: DailyStat[];
  title: string;
  subtitle?: string;
  tone?: Tone;
  height?: number;
  className?: string;
};

export function StatGraph({
  data,
  title,
  subtitle = "Сүүлийн 30 хоног",
  tone = "primary",
  height = 200,
  className,
}: StatGraphProps) {
  const gradientId = React.useId().replace(/:/g, "");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lineRef = React.useRef<SVGPathElement>(null);
  const [width, setWidth] = React.useState(0);
  const [pathLen, setPathLen] = React.useState(0);
  const [hover, setHover] = React.useState<number | null>(null);

  const measure = React.useCallback(() => {
    const node = containerRef.current;
    if (!node) return;
    const next = node.clientWidth;
    setWidth((prev) => (Math.abs(next - prev) < 2 ? prev : next));
  }, []);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let rafId = 0;
    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [measure]);

  React.useEffect(() => {
    if (width < 2 || !lineRef.current) return;
    const length = lineRef.current.getTotalLength();
    if (length > 0) setPathLen(length);
  }, [width]);

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const topValue = Math.max(...data.map((item) => item.count));
  const yMax = niceMax(topValue);

  const padL = 30;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const plotTop = padT;
  const plotBottom = height - padB;
  const plotHeight = plotBottom - plotTop;
  const innerWidth = Math.max(1, width - padL - padR);
  const n = data.length;

  const xAt = (index: number) =>
    padL + (n === 1 ? innerWidth / 2 : (index / (n - 1)) * innerWidth);
  const yAt = (value: number) => plotTop + plotHeight * (1 - value / yMax);

  const points: Point[] = data.map((item, i) => ({
    x: xAt(i),
    y: yAt(item.count),
  }));

  const linePath = smoothPath(points);
  const areaPath =
    points.length > 1
      ? `${linePath} L${points[points.length - 1].x},${plotBottom} L${points[0].x},${plotBottom} Z`
      : "";
  const showChart = linePath.length > 0;

  const ticks = [
    { value: 0, label: "0" },
    { value: yMax / 2, label: Math.round(yMax / 2).toLocaleString("en-US") },
    { value: yMax, label: Math.round(yMax).toLocaleString("en-US") },
  ];
  const labelIndexes = Array.from(
    new Set([0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1])
  );

  const hovered = hover !== null && hover >= 0 && hover < n ? data[hover] : null;
  const maxIndex = data.reduce(
    (best, item, i) => (item.count > (data[best]?.count ?? -1) ? i : best),
    0
  );
  const drawReady = pathLen > 0;

  return (
    <div
      className={cn(
        "min-w-0 w-full overflow-hidden rounded-2xl border bg-card shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-right">
          <p
            className="text-2xl font-bold leading-none tabular-nums tracking-tight"
            style={{ color: TONES[tone].stroke }}
          >
            {total.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            нийт
          </p>
        </div>
      </div>

      <div ref={containerRef} className="relative px-2 pb-2" style={{ height }}>
        {width < 2 ? (
          <div className="shimmer rounded-lg bg-muted/50" style={{ height }} aria-hidden="true" />
        ) : showChart ? (
          <>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
              className="block w-full select-none"
              style={{ height }}
              role="img"
              aria-label={`${title} график`}
            >
              <defs>
                <linearGradient id={`area-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TONES[tone].areaTop} />
                  <stop offset="100%" stopColor={TONES[tone].areaBottom} />
                </linearGradient>
              </defs>

              {ticks.map((tick) => (
                <g key={tick.value}>
                  <line
                    x1={padL}
                    x2={width - padR}
                    y1={yAt(tick.value)}
                    y2={yAt(tick.value)}
                    stroke="currentColor"
                    className="text-muted-foreground/35"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={padL - 7}
                    y={yAt(tick.value) + 3}
                    textAnchor="end"
                    fontSize="10"
                    className="fill-muted-foreground tabular-nums"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {labelIndexes.map((i) => (
                <text
                  key={i}
                  x={xAt(i)}
                  y={height - 7}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-muted-foreground tabular-nums"
                >
                  {data[i]?.label}
                </text>
              ))}

              {hovered ? (
                <line
                  x1={xAt(hover!)}
                  x2={xAt(hover!)}
                  y1={plotTop}
                  y2={plotBottom}
                  stroke={TONES[tone].stroke}
                  strokeOpacity="0.22"
                  strokeWidth="1"
                />
              ) : null}

              {areaPath ? (
                <path d={areaPath} fill={`url(#area-${gradientId})`} className="chart-fade-in" />
              ) : null}

              {linePath ? (
                <path
                  ref={lineRef}
                  d={linePath}
                  fill="none"
                  stroke={TONES[tone].stroke}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn("chart-draw", !drawReady && "opacity-0")}
                  style={{ filter: `drop-shadow(0 1px 2px ${TONES[tone].glow})` }}
                />
              ) : null}

              {hovered ? (
                <circle
                  cx={xAt(hover!)}
                  cy={yAt(hovered.count)}
                  r="4.5"
                  fill={TONES[tone].stroke}
                  stroke="#fff"
                  strokeWidth="2"
                  className="chart-pop"
                  style={{ filter: `drop-shadow(0 0 6px ${TONES[tone].glow})` }}
                />
              ) : null}

              <circle
                cx={xAt(maxIndex)}
                cy={yAt(data[maxIndex].count)}
                r="3"
                fill={TONES[tone].stroke}
                stroke="#fff"
                strokeWidth="1.5"
                className="chart-pop"
                style={{
                  filter: `drop-shadow(0 0 5px ${TONES[tone].glow})`,
                  animationDelay: "0.9s",
                }}
              />

              <rect
                x={padL}
                y={plotTop}
                width={innerWidth}
                height={plotHeight}
                fill="transparent"
                onMouseMove={(event) => {
                  const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
                  const relX = event.clientX - rect.left;
                  const i = Math.round((relX / innerWidth) * (n - 1));
                  setHover(Math.max(0, Math.min(n - 1, i)));
                }}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "crosshair" }}
              />
            </svg>

            {hovered && hover !== null ? (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border bg-background/95 px-3 py-2 shadow-lg backdrop-blur"
                style={{ left: clamp(xAt(hover), width), top: Math.max(16, yAt(hovered.count) - 10) }}
              >
                <p className="text-[11px] font-semibold tracking-wide">{hovered.label}</p>
                <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-sm font-bold tabular-nums">
                  <span className="h-2 w-2 rounded-full" style={{ background: TONES[tone].stroke }} />
                  {hovered.count.toLocaleString("en-US")} хүн
                </p>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3 sm:px-5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
            TONES[tone].chip
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Дээд: {topValue.toLocaleString("en-US")}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {data[maxIndex]?.label}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {n} өдөр
        </span>
      </div>
    </div>
  );
}

function clamp(x: number, width: number) {
  return Math.min(width - 56, Math.max(56, x));
}