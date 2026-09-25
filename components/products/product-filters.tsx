"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/enums";

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Шинэ",
  LIKE_NEW: "Бараг шинэ",
  USED: "Хуучин",
};

type Params = Record<string, string | undefined>;

type ProductFiltersProps = {
  categories: { id: string; slug: string; name: string }[];
  current: Params;
  onOpenChange?: (open: boolean) => void;
};

function buildQuery(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) usp.set(key, value);
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export function FiltersContent({
  categories,
  current,
  onChange,
}: {
  categories: ProductFiltersProps["categories"];
  current: Record<string, string | undefined>;
  onChange: (patch: Record<string, string>) => void;
}) {
  const [priceMin, setPriceMin] = React.useState(current.priceMin ?? "");
  const [priceMax, setPriceMax] = React.useState(current.priceMax ?? "");

  function applyPrice() {
    const next: Record<string, string> = {};
    if (priceMin) next.priceMin = String(Number(priceMin) || "");
    if (priceMax) next.priceMax = String(Number(priceMax) || "");
    onChange({ ...next, page: "" });
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="filter-category" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Категори
        </Label>
        <Select
          value={current.category ?? "all"}
          onValueChange={(value) =>
            onChange({ category: value === "all" ? "" : value, page: "" })
          }
        >
          <SelectTrigger id="filter-category" className="mt-2">
            <SelectValue placeholder="Бүх категори" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх категори</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Үнэ (₮)
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Доод"
            inputMode="numeric"
            value={priceMin}
            onChange={(event) => setPriceMin(event.target.value)}
            onBlur={applyPrice}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyPrice();
            }}
            aria-label="Хамгийн бага үнэ"
          />
          <Input
            type="number"
            min={0}
            placeholder="Дээд"
            inputMode="numeric"
            value={priceMax}
            onChange={(event) => setPriceMax(event.target.value)}
            onBlur={applyPrice}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyPrice();
            }}
            aria-label="Хамгийн их үнэ"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="filter-condition" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Төлөв
        </Label>
        <Select
          value={current.condition ?? "all"}
          onValueChange={(value) =>
            onChange({ condition: value === "all" ? "" : value, page: "" })
          }
        >
          <SelectTrigger id="filter-condition" className="mt-2">
            <SelectValue placeholder="Бүгд" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүгд</SelectItem>
            {Object.values(ProductCondition).map((value) => (
              <SelectItem key={value} value={value}>
                {CONDITION_LABELS[value] ?? value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-status" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Борлуулалт
        </Label>
        <Select
          value={current.status ?? "all"}
          onValueChange={(value) =>
            onChange({ status: value === "all" ? "" : value, page: "" })
          }
        >
          <SelectTrigger id="filter-status" className="mt-2">
            <SelectValue placeholder="Бүгд" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүгд</SelectItem>
            <SelectItem value={ProductStatus.AVAILABLE}>Зарагдаагүй</SelectItem>
            <SelectItem value={ProductStatus.SOLD}>Зарагдсан</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => onChange({})}
      >
        <RotateCcw className="h-4 w-4" />
        Шүүлтийг цэвэрлэх
      </Button>
    </div>
  );
}

export function ProductFilters(props: ProductFiltersProps) {
  const router = useRouter();
  const { categories, current, onOpenChange } = props;

  function handleChange(patch: Record<string, string>) {
    const merged: Record<string, string | undefined> = { ...current };
    for (const [key, value] of Object.entries(patch)) {
      if (value) merged[key] = value;
      else delete merged[key];
    }
    merged.page = merged.page ?? "";
    delete merged.page;

    const qs = buildQuery(merged);
    router.push(`/products${qs}`, { scroll: false });
    onOpenChange?.(false);
  }

  const cleanCurrent: Record<string, string> = {};
  for (const [key, value] of Object.entries(current)) {
    if (value) cleanCurrent[key] = value;
  }

  return (
    <FiltersContent
      categories={categories}
      current={cleanCurrent}
      onChange={handleChange}
    />
  );
}