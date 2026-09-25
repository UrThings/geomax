"use client";

import * as React from "react";
import { Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatGraph } from "@/components/admin/stat-graph";
import { formatNumber } from "@/lib/utils";
import type { DailyStat } from "@/lib/data";

type ProductViewStatsDialogProps = {
  productId: string;
  productName: string;
  initialTotal: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type LoadedStats = {
  productId: string;
  total: number;
  daily: DailyStat[];
};

export function ProductViewStatsDialog({
  productId,
  productName,
  initialTotal,
  open,
  onOpenChange,
}: ProductViewStatsDialogProps) {
  const [stats, setStats] = React.useState<LoadedStats | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;
    fetch(`/api/stats/product?productId=${encodeURIComponent(productId)}`)
      .then((response) => response.json())
      .then((result) => {
        if (cancelled) return;
        if (result?.error) {
          setError(result.error);
        } else {
          setStats({ productId, total: result.total, daily: result.daily });
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Статистик ачаалахад алдаа гарлаа.");
      });

    return () => {
      cancelled = true;
    };
  }, [open, productId]);

  const loaded = stats && stats.productId === productId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Үзсэн хүний тоо
          </DialogTitle>
          <DialogDescription className="line-clamp-1">
            {productName}
          </DialogDescription>
        </DialogHeader>

        <div className="text-center">
          <p className="text-4xl font-bold tabular-nums text-primary">
            {formatNumber(loaded ? stats!.total : initialTotal)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">хүн үзсэн</p>
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : loaded ? (
          <StatGraph
            data={stats!.daily}
            title="Өдөр бүрийн үзэлт"
            subtitle="Сүүлийн 30 хоног"
            tone="sky"
            height={170}
          />
        ) : (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}