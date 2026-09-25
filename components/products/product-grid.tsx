import { ProductCard } from "@/components/products/product-card";
import { Reveal } from "@/components/reveal";
import type { PublicProduct } from "@/lib/data";

export function ProductGrid({ products }: { products: PublicProduct[] }) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <Reveal key={product.id} delay={(index % 4) * 70} className="h-full">
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}