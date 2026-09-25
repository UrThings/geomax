"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AdminNavLinks } from "@/components/admin/admin-sidebar";

export function AdminHeader({ title }: { title: string }) {
  const [open, setOpen] = React.useState(false);

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
          <div className="absolute inset-y-0 left-0 w-72 bg-background shadow-lg">
            <div className="flex h-14 items-center border-b px-4">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="text-base font-bold"
              >
                Админ панел
              </Link>
            </div>
            <div className="p-3">
              <AdminNavLinks onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}