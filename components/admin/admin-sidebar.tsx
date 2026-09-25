"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Folder,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/admin";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Бараанууд", icon: Package },
  { href: "/admin/products/new", label: "Бараа нэмэх", icon: PlusCircle },
  { href: "/admin/categories", label: "Категори", icon: Folder },
  { href: "/admin/settings", label: "Тохиргоо", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Админ цэс" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-4 py-5 text-base font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
          А
        </span>
        Админ панел
      </Link>
      <div className="px-3">
        <AdminNavLinks />
      </div>
      <div className="mt-auto p-3 border-t">
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            await logoutAction();
            router.push("/admin/login");
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Гарах
        </button>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Package className="h-4 w-4 shrink-0" />
          Сайт руу очих
        </Link>
      </div>
    </div>
  );
}