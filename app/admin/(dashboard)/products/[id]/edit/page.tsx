import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById, getAllCategoriesForAdmin } from "@/lib/data";
import { getSettings } from "@/lib/site";
import { updateProductAction } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "Бараа засах — Админ",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, settings] = await Promise.all([
    getProductById(id),
    getAllCategoriesForAdmin(),
    getSettings(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Бараа засах</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Мэдээллийг шинэчилээд хадгална уу.
        </p>
      </div>

      <ProductForm
        defaultValues={{
          name: product.name,
          slug: product.slug,
          price: product.price,
          categoryId: product.categoryId,
          condition: product.condition,
          status: product.status,
          description: product.description,
          location: product.location ?? "",
          phone: product.phone ?? "",
          facebookUrl: product.facebookUrl ?? "",
          messengerUrl: product.messengerUrl ?? "",
          featured: product.featured,
          specs: (product.specs ?? null) as Record<
            string,
            string | number | boolean
          > | null,
        }}
        images={product.images.map((image) => ({
          url: image.url,
          alt: image.alt,
        }))}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        action={(input) => updateProductAction(id, input)}
        submitLabel="Хадгалах"
        cancelHref="/admin/products"
        siteContact={{
          phone: settings.phone,
          facebookUrl: settings.facebookUrl,
          messengerUrl: settings.messengerUrl,
        }}
      />
    </div>
  );
}