import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";
import { SearchBar } from "@/components/layout/navbar";
import { ProductGrid } from "@/components/products/product-grid";
import { CategoryCard } from "@/components/products/category-card";
import { ContactButtons } from "@/components/products/contact-buttons";
import { Reveal } from "@/components/reveal";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/site";
import { getCategories, getHomeProducts } from "@/lib/data";

export const metadata = {
  description: "Асуулт тодруулах зүйл байгаа бол шууд холбогдоорой.",
};

export default async function HomePage() {
  const settings = await getSettings();
  const [catalog, categories] = await Promise.all([
    getHomeProducts(),
    getCategories(),
  ]);

  const title = settings.siteTitle || settings.ownerName;
  const tagline = settings.siteTagline || "Сонгож үзээд, шууд холбогдоорой.";

  return (
    <div>
      <section className="bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-24 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <PackageSearch className="h-3.5 w-3.5" />
            {settings.ownerName}
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {tagline}
          </p>
          <div className="mt-8 w-full max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/products">
                Бүх бараа үзэх
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Надтай холбогдох</Link>
            </Button>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label="Категори">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Категори</h2>
                <p className="mt-1 text-sm text-muted-foreground">Бараануудыг төрлөөр нь үзэх</p>
              </div>
              <Link
                href="/products"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                Бүх бараа
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
            {categories.map((category, index) => (
              <Reveal key={category.id} delay={(index % 6) * 60}>
                <CategoryCard
                  name={category.name}
                  slug={category.slug}
                  imageUrl={category.imageUrl}
                  count={category._count.products}
                />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {catalog.latest.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label="Шинэ бараанууд">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Шинээр нэмэгдсэн бараа</h2>
                <p className="mt-1 text-sm text-muted-foreground">Хамгийн сүүлийн үеийн нийтлэлүүд</p>
              </div>
              <Link
                href="/products"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                Бүгдийг үзэх
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <ProductGrid products={catalog.latest} />
        </section>
      ) : null}

      {catalog.featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-label="Онцлох бараанууд">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Онцлох бараа</h2>
                <p className="mt-1 text-sm text-muted-foreground">Борлуулагчийн санал болгож буй бараанууд</p>
              </div>
              <Link
                href="/products"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                Бүгдийг үзэх
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <ProductGrid products={catalog.featured} />
        </section>
      ) : null}

      {catalog.latest.length === 0 && catalog.featured.length === 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <EmptyState
            icon={PackageSearch}
            title="Одоогоор бараа байхгүй байна"
            description="Удахгүй шинэ бараанууд нэмэгдэх болно. Дараа дахин зочлоод үзээрэй."
            actionLabel="Сайт руу буцах"
            actionHref="/"
          />
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal direction="zoom">
          <div className="rounded-2xl border bg-muted/40 p-6 text-center sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Асуулт байна уу?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Барааны талаар сонирхсон асуултаа асуугаарай. {settings.ownerName} тантай холбогдоно.
            </p>
            <div className="mx-auto mt-6 max-w-xl text-left">
              <ContactButtons
                phone={settings.phone}
                facebookUrl={settings.facebookUrl}
                messengerUrl={settings.messengerUrl}
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}