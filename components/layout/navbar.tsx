"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Нүүр" },
  { href: "/products", label: "Бүх бараа" },
  { href: "/contact", label: "Холбоо барих" },
];

export function SearchBar({
  defaultValue = "",
  onSubmitted,
}: {
  defaultValue?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = React.useState(defaultValue);
  const inputId = React.useId();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    onSubmitted?.();
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        Бараа хайх
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Бараа хайх..."
        autoComplete="off"
        className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-24 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 flex h-7 -translate-y-1/2 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <Search className="h-3.5 w-3.5" />
        Хайх
      </button>
    </form>
  );
}

export default function Navbar({ siteTitle }: { siteTitle: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [lastPathname, setLastPathname] = React.useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-base font-bold tracking-tight"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
            G
          </span>
          <span className="truncate">{siteTitle}</span>
        </Link>

        <nav
          aria-label="Үндсэн цэс"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden w-64 lg:block">
            <SearchBar />
          </div>
          <button
            type="button"
            aria-label="Хайлт"
            aria-expanded={searchOpen}
            aria-controls="header-search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMobileOpen(false);
            }}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Цэс хаах" : "Цэс нээх"}
            onClick={() => {
              setMobileOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div
          id="header-search"
          className="border-t bg-background px-4 py-3 lg:hidden"
        >
          <SearchBar onSubmitted={() => setSearchOpen(false)} />
        </div>
      ) : null}

      {mobileOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Мобайл цэс"
          className="border-t bg-background px-4 py-3 md:hidden"
        >
          <div className="mb-3">
            <SearchBar />
          </div>
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}