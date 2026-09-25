import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  pageSize?: number;
  total?: number;
};

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number
) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "page") usp.set(key, value);
  }
  if (page > 1) usp.set("page", String(page));
  const qs = usp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageNumbers(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function Pagination({
  basePath,
  params,
  page,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const numbers = pageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Хуудаслалт"
      className="flex items-center justify-center gap-1 py-2"
    >
      {page > 1 ? (
        <Link
          href={buildHref(basePath, params, page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-md border text-sm hover:bg-muted"
          aria-label="Өмнөх хуудас"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : null}

      {numbers.map((number, index) =>
        number === "ellipsis" ? (
          <span
            key={`e-${index}`}
            className="flex h-9 items-center px-1 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={number}
            href={buildHref(basePath, params, number)}
            aria-current={number === page ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm",
              number === page
                ? "border-primary bg-primary text-primary-foreground font-semibold"
                : "hover:bg-muted"
            )}
          >
            {number}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, params, page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-md border text-sm hover:bg-muted"
          aria-label="Дараах хуудас"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </nav>
  );
}