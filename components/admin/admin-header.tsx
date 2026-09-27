"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  AdminNavLinks,
  AdminSidebarBrand,
  AdminSidebarFooter,
} from "@/components/admin/admin-sidebar";

export function AdminHeader({ title }: { title: string }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted lg:hidden"
          aria-label={open ? "Цэс хаах" : "Цэс нээх"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <h1 className="truncate text-base font-semibold">{title}</h1>
        <Link
          href="/admin/products/new"
          className="ml-auto hidden rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:block"
        >
          + Бараа нэмэх
        </Link>
      </header>

      {open ? (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Админ цэс"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex h-dvh max-w-[85vw] w-72 flex-col bg-background shadow-lg">
            <AdminSidebarBrand onNavigate={() => setOpen(false)} />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
              <AdminNavLinks onNavigate={() => setOpen(false)} />
            </div>
            <AdminSidebarFooter onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}