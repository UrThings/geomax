import type { Metadata } from "next";
import { AdminCategoriesManager } from "@/components/admin/admin-categories-manager";
import { getAllCategoriesForAdmin } from "@/lib/data";

export const metadata: Metadata = {
  title: "Категори — Админ",
};

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Категори</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Барааны төрлүүдийг удирдах
        </p>
      </div>

      <AdminCategoriesManager items={categories} />
    </div>
  );
}