import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesForAdmin } from "@/lib/data";
import { getSettings } from "@/lib/site";
import { createProductAction } from "@/lib/actions/admin";
import {
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Шинэ бараа — Админ",
};

export default async function AdminNewProductPage() {
  const [categories, settings] = await Promise.all([
    getAllCategoriesForAdmin(),
    getSettings(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Шинэ бараа нэмэх</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Бүх шаардлагатай мэдээллийг бөглөөд хадгална уу.
        </p>
      </div>

      <ProductForm
        defaultValues={{
          name: "",
          slug: "",
          price: 0,
          categoryId: categories[0]?.id ?? "",
          condition: ProductCondition.NEW,
          status: ProductStatus.AVAILABLE,
          description: "",
          location: "",
          phone: "",
          facebookUrl: "",
          messengerUrl: "",
          featured: false,
          specs: null,
        }}
        images={[]}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        action={createProductAction}
        submitLabel="Бараа нэмэх"
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