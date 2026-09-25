"use client";

import { useRouter } from "next/navigation";
import { ArrowDownWideNarrow } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";

type ProductSortProps = {
  value?: string;
  params?: Record<string, string>;
  total?: number;
};

export function ProductSort({ value = "newest", params = {}, total }: ProductSortProps) {
  const router = useRouter();

  function handleChange(sort: string) {
    const usp = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val && key !== "sort" && key !== "page") usp.set(key, val);
    }
    usp.set("sort", sort);
    const qs = usp.toString();
    router.push(qs ? `/products?${qs}` : "/products", { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      {typeof total === "number" ? (
        <p className="hidden text-sm text-muted-foreground sm:block">
          Нийт <span className="font-semibold text-foreground">{total}</span> бараа
        </p>
      ) : null}
      <div className="relative ml-auto">
        <ArrowDownWideNarrow className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger
            className="w-44 pl-9 sm:w-56"
            aria-label="Эрэмбэлэх"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}