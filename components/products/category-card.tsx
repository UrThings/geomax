import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryCardProps = {
  name: string;
  slug: string;
  imageUrl?: string | null;
  count?: number;
};

export function CategoryCard({ name, slug, imageUrl, count }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${slug}`}
      className={cn(
        "group relative flex h-28 flex-col justify-end overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:h-32"
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/60">
          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative">
        <p className="text-sm font-bold text-white">{name}</p>
        {typeof count === "number" ? (
          <p className="text-xs text-white/80">{count} бараа</p>
        ) : null}
      </div>
    </Link>
  );
}