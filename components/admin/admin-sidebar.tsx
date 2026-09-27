"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
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

export function AdminSidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 border-b px-4 text-base font-bold",
        "lg:h-auto lg:py-5"
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
        А
      </span>
      Админ панел
    </Link>
  );
}

export function AdminSidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  return (
    <div className="mt-auto shrink-0 border-t p-3">
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
        onClick={onNavigate}
        className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        Сайт руу очих
      </Link>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <AdminSidebarBrand />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        <AdminNavLinks />
      </div>
      <AdminSidebarFooter />
    </div>
  );
}