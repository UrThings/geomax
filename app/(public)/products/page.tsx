import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductSort } from "@/components/products/product-sort";
import { ProductFilters } from "@/components/products/product-filters";
import { MobileFilterDialog } from "@/components/products/mobile-filter-dialog";
import { Pagination } from "@/components/products/pagination";
import { EmptyState } from "@/components/empty-state";
import { getPublicProducts, getCategories } from "@/lib/data";
import {
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Бүх бараа",
  description: "Бэлэн байгаа бүх барааны жагсаалт.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function asInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
}

export default async function ProductsPage({ searchParams }: Props) {
  const raw = await searchParams;

  const q = first(raw.q)?.trim() ?? "";
  const category = first(raw.category)?.trim() ?? "";
  const priceMin = asInt(first(raw.priceMin));
  const priceMax = asInt(first(raw.priceMax));
  const condition = Object.values(ProductCondition).includes(
    first(raw.condition) as ProductCondition
  )
    ? (first(raw.condition) as ProductCondition)
    : null;
  const status = Object.values(ProductStatus).includes(
    first(raw.status) as ProductStatus
  )
    ? (first(raw.status) as ProductStatus)
    : null;
  const sort = first(raw.sort) ?? "newest";
  const pageRaw = asInt(first(raw.page));
  const page = pageRaw ?? 1;

  const [catalog, categories] = await Promise.all([
    getPublicProducts({
      q: q || undefined,
      categorySlug: category || undefined,
      priceMin,
      priceMax,
      condition,
      status,
      sort,
      page,
    }),
    getCategories(),
  ]);

  const filterParamValue = (value: string) => (value ? value : undefined);
  const current: Record<string, string | undefined> = {
    category: filterParamValue(category),
    condition: filterParamValue(condition ?? ""),
    status: filterParamValue(status ?? ""),
    priceMin: filterParamValue(priceMin !== null ? String(priceMin) : ""),
    priceMax: filterParamValue(priceMax !== null ? String(priceMax) : ""),
  };

  const filterCategories = categories.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
  }));

  const sortParams: Record<string, string> = {};
  if (q) sortParams.q = q;
  if (category) sortParams.category = category;
  if (priceMin !== null) sortParams.priceMin = String(priceMin);
  if (priceMax !== null) sortParams.priceMax = String(priceMax);
  if (condition) sortParams.condition = condition;
  if (status) sortParams.status = status;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {q ? `Хайлт: "${q}"` : "Бүх бараа"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {catalog.total > 0
            ? `${catalog.total} бараа олдлоо`
            : "Бараа олдсонгүй"}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border bg-card p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Шүүлтүүр
            </h2>
            <ProductFilters
              categories={filterCategories}
              current={current}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-4">
            <MobileFilterDialog
              categories={filterCategories}
              current={current}
            />
            <ProductSort value={sort} params={sortParams} total={catalog.total} />
          </div>

          {catalog.items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Таны хайлтад тохирох бараа олдсонгүй"
              description="Шүүлтийн нөхцлөө өөрчилж дахин оролдоорой."
              actionLabel="Шүүлтийг цэвэрлэх"
              actionHref="/products"
            />
          ) : (
            <>
              <ProductGrid products={catalog.items} />
              <Pagination
                basePath="/products"
                params={sortParams}
                page={catalog.page}
                totalPages={catalog.totalPages}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}