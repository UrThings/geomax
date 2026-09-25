import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderX } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import { Pagination } from "@/components/products/pagination";
import { EmptyState } from "@/components/empty-state";
import { getCategoryBySlug, getPublicProducts, getCategories } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Категори олдсонгүй" };
  return {
    title: category.name,
    description: category.description ?? `${category.name} категорийн бараанууд.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const raw = await searchParams;
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const page = Math.max(1, Number(rawPage) || 1);

  const [category, catalog, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getPublicProducts({ categorySlug: slug, page }),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="Холбоос" className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Нүүр</Link>
        {" / "}
        <Link href="/products" className="hover:text-foreground">Бүх бараа</Link>
        {" / "}
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {category.description}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">
          {formatNumber(catalog.total)} бараа
        </p>
      </div>

      {catalog.items.length === 0 ? (
        <EmptyState
          icon={FolderX}
          title="Энэ категорид одоогоор бараа байхгүй"
          description="Бусад категориудыг үзэж үзээрэй."
          actionLabel="Бүх бараа руу буцах"
          actionHref="/products"
        />
      ) : (
        <>
          <ProductGrid products={catalog.items} />
          <Pagination
            basePath={`/category/${slug}`}
            params={{}}
            page={catalog.page}
            totalPages={catalog.totalPages}
          />
        </>
      )}

      {categories.length > 0 ? (
        <section className="mt-12 border-t pt-8">
          <h2 className="mb-4 text-lg font-semibold">Бусад категори</h2>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((item) => item.slug !== slug)
              .slice(0, 10)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/category/${item.slug}`}
                  className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  {item.name}
                </Link>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}