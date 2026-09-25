import type { Metadata } from "next";
import { AdminProductsList } from "@/components/admin/admin-products-list";
import { getAdminProducts, getAllCategoriesForAdmin } from "@/lib/data";
import { ProductStatus } from "@/lib/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Бараанууд — Админ",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const q = first(raw.q)?.trim() ?? "";
  const categoryId = first(raw.categoryId) ?? "";
  const statusRaw = first(raw.status);
  const status =
    statusRaw && Object.values(ProductStatus).includes(statusRaw as ProductStatus)
      ? (statusRaw as ProductStatus)
      : null;
  const pageRaw = Number(first(raw.page)) || 1;
  const page = Math.max(1, pageRaw);

  const [catalog, categories] = await Promise.all([
    getAdminProducts({ q: q || undefined, categoryId: categoryId || undefined, status, page }),
    getAllCategoriesForAdmin(),
  ]);

  const notice = raw.created
    ? "Бараа амжилттай нэмэгдлээ."
    : raw.updated
      ? "Бараа амжилттай шинэчлэгдлээ."
      : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Бараанууд</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Бүх барааны бүртгэлийг удирдах
          </p>
        </div>
      </div>

      {notice ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      ) : null}

      <AdminProductsList
        items={catalog.items}
        total={catalog.total}
        page={catalog.page}
        totalPages={catalog.totalPages}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        filters={{
          q: q || undefined,
          categoryId: categoryId || undefined,
          status: status ?? undefined,
        }}
      />
    </div>
  );
}