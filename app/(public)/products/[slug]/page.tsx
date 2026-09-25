import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug } from "@/lib/data";
import { getSettings } from "@/lib/site";
import { ProductGallery } from "@/components/products/product-gallery";
import { ContactButtons } from "@/components/products/contact-buttons";
import { ProductViewTracker } from "@/components/analytics/product-view-tracker";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PackageX,
  MapPin,
  Calendar,
  Star,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/enums";

const CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: "Шинэ",
  LIKE_NEW: "Бараг шинэ",
  USED: "Хэрэглэж байсан",
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Бараа олдсонгүй" };
  }
  const description = product.description.slice(0, 160);
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={PackageX}
          title="Бараа олдсонгүй"
          description="Холбоос буруу байх эсвэл бараа устгагдсан байж болно."
          actionLabel="Бүх бараа руу буцах"
          actionHref="/products"
        />
      </div>
    );
  }

  const settings = await getSettings();
  const sold = product.status === ProductStatus.SOLD;

  const specEntries = product.specs
    ? Object.entries(product.specs).filter(
        ([, value]) => value !== null && value !== undefined
      )
    : [];

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="Холбоос" className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Нүүр
        </Link>
        {" / "}
        <Link href={`/category/${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={product.images.map((image) => ({
            url: image.url,
            alt: image.alt,
          }))}
          name={product.name}
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{CONDITION_LABELS[product.condition]}</Badge>
            {sold ? (
              <Badge variant="destructive" className="font-bold">ЗАРАГДСАН</Badge>
            ) : null}
            {product.featured ? (
              <Badge variant="secondary">
                <Star className="h-3 w-3" />
                Онцлох
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {product.name}
          </h1>

          <p
            className={
              sold
                ? "mt-4 text-3xl font-bold tracking-tight text-muted-foreground line-through sm:text-4xl"
                : "mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
            }
          >
            {formatPrice(product.price)}
          </p>

          {product.location || product.createdAt ? (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {product.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {product.location}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(product.createdAt)} нийтэлсэн
              </span>
            </div>
          ) : null}

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Холбоо барих</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {sold
                ? "Энэхүү бараа зарагдсан боловч бусад барааг сонирхож болно."
                : "Энэ барааг сонирхож байвал доорх сувгуудаар холбогдоорой."}
            </p>
            <div className="mt-3">
              <ContactButtons
                phone={(product.phone ?? settings.phone) || null}
                facebookUrl={(product.facebookUrl ?? settings.facebookUrl) || null}
                messengerUrl={(product.messengerUrl ?? settings.messengerUrl) || null}
                sold={sold}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {product.description ? (
          <section aria-label="Тайлбар">
            <h2 className="text-lg font-semibold">Тайлбар</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {product.description.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        ) : null}

        {specEntries.length > 0 ? (
          <section aria-label="Тодорхойлолт">
            <h2 className="text-lg font-semibold">Тодорхойлолт</h2>
            <dl className="mt-3 overflow-hidden rounded-lg border">
              {specEntries.map(([key, value], index) => (
                <div
                  key={key}
                  className={
                    index % 2 === 0
                      ? "grid grid-cols-2 gap-2 px-4 py-2.5 text-sm"
                      : "grid grid-cols-2 gap-2 bg-muted/40 px-4 py-2.5 text-sm"
                  }
                >
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      <div className="mt-12 border-t pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Илүү олон бараа үзмээр байна уу?
        </p>
        <Button asChild className="mt-3">
          <Link href="/products">Бүх бараа руу буцах</Link>
        </Button>
      </div>
      </div>
    </>
  );
}