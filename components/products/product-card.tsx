import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageIcon, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/enums";
import { cn, formatPrice } from "@/lib/utils";
import type { PublicProduct } from "@/lib/data";

const CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: "Шинэ",
  LIKE_NEW: "Бараг шинэ",
  USED: "Хуучин",
};

export function ProductCard({ product }: { product: PublicProduct }) {
  const image = product.images[0];
  const sold = product.status === ProductStatus.SOLD;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
        aria-label={product.name}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-background/95 backdrop-blur">
            {CONDITION_LABELS[product.condition]}
          </Badge>
          {sold ? (
            <Badge
              variant="destructive"
              className="font-bold tracking-wide"
            >
              ЗАРАГДСАН
            </Badge>
          ) : null}
        </div>

        {product.featured && !sold ? (
          <Badge className="absolute right-2 top-2 bg-primary/95 backdrop-blur">
            Онцлох
          </Badge>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <p className="text-xs font-medium text-muted-foreground">
          {product.category.name}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug hover:text-primary sm:text-base"
        >
          {product.name}
        </Link>
        <p
          className={cn(
            "text-base font-bold tracking-tight sm:text-lg",
            sold && "text-muted-foreground line-through decoration-muted-foreground/50"
          )}
        >
          {formatPrice(product.price)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {product.location ? (
            <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{product.location}</span>
            </span>
          ) : (
            <span />
          )}
        </div>
        <Button asChild variant="outline" size="sm" className="mt-2 w-full">
          <Link href={`/products/${product.slug}`}>
            Дэлгэрэнгүй
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}