"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FiltersContent } from "@/components/products/product-filters";

type MobileFilterDialogProps = {
  categories: { id: string; slug: string; name: string }[];
  current: Record<string, string | undefined>;
};

export function MobileFilterDialog({
  categories,
  current,
}: MobileFilterDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Шүүлтүүр
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Шүүлтүүр</DialogTitle>
          <DialogDescription>
            Хайлтын нөхцлийг тохируулаад үр дүнг харна уу.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <FiltersContent
            categories={categories}
            current={current}
            onChange={(patch) => {
              const merged: Record<string, string> = {};
              const source = { ...current, ...patch };
              for (const [key, value] of Object.entries(source)) {
                if (value) merged[key] = value;
              }
              delete merged.page;

              const usp = new URLSearchParams();
              for (const [key, value] of Object.entries(merged)) {
                usp.set(key, value);
              }
              const qs = usp.toString();
              setOpen(false);
              router.push(qs ? `/products?${qs}` : "/products", {
                scroll: false,
              });
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}