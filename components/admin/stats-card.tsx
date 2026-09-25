import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatsCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  spark?: number[];
};

export function StatsCard({ label, value, icon: Icon, hint, spark }: StatsCardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {spark && spark.length > 1 ? <Sparkline data={spark} /> : null}
    </Card>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const gradientId = useId().replace(/:/g, "");
  const maxValue = Math.max(1, ...data);
  const n = data.length;

  const linePoints = data
    .map((value, i) => {
      const x = (i / (n - 1)) * 100;
      const y = 30 - (value / maxValue) * 26 - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mt-3 h-8" aria-hidden="true">
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={`spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.35)" />
            <stop offset="100%" stopColor="rgba(124, 58, 237, 0.02)" />
          </linearGradient>
        </defs>
        <polygon points={`0,32 ${linePoints} 100,32`} fill={`url(#spark-${gradientId})`} />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}