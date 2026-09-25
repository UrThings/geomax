"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductViewStatsDialog } from "@/components/admin/product-view-stats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Pagination } from "@/components/products/pagination";
import { formatDate, formatPrice } from "@/lib/utils";
import { ProductStatus } from "@/lib/generated/prisma/enums";
import {
  deleteProductAction,
  setProductStatusAction,
  toggleProductFeaturedAction,
} from "@/lib/actions/admin";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  status: ProductStatus;
  featured: boolean;
  createdAt: Date;
  category: { id: string; name: string };
  images: { url: string; alt: string | null }[];
  views: { count: number } | null;
};

type AdminProductsListProps = {
  items: AdminProductRow[];
  total: number;
  page: number;
  totalPages: number;
  categories: { id: string; name: string }[];
  filters: { q?: string; categoryId?: string; status?: string };
};

export function AdminProductsList({
  items,
  total,
  page,
  totalPages,
  categories,
  filters,
}: AdminProductsListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState(filters.q ?? "");
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [viewProductId, setViewProductId] = React.useState<string | null>(null);

  const deleteTarget = items.find((item) => item.id === deleteId) ?? null;
  const viewTarget = items.find((item) => item.id === viewProductId) ?? null;

  function applyPatch(patch: Record<string, string>) {
    const params = new URLSearchParams();
    if (patch.q) params.set("q", patch.q);
    if (patch.categoryId) params.set("categoryId", patch.categoryId);
    if (patch.status) params.set("status", patch.status);
    const qs = params.toString();
    router.push(qs ? `/admin/products?${qs}` : "/admin/products");
  }

  async function runAction(
    id: string,
    action: () => Promise<void | { error?: string } | undefined>
  ) {
    setPendingId(id);
    try {
      const result = await action();
      if (result?.error) {
        setDeleteError(result.error);
      } else {
        router.refresh();
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          role="search"
          className="relative sm:max-w-xs"
          onSubmit={(event) => {
            event.preventDefault();
            applyPatch({ q: search.trim(), categoryId: filters.categoryId ?? "", status: filters.status ?? "" });
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Нэрээр хайх..."
            aria-label="Бараа хайх"
            className="pl-9"
          />
        </form>

        <div className="flex items-center gap-2">
          <Select
            value={filters.categoryId ?? "all"}
            onValueChange={(value) =>
              applyPatch({
                q: filters.q ?? "",
                categoryId: value === "all" ? "" : value,
                status: filters.status ?? "",
              })
            }
          >
            <SelectTrigger aria-label="Категориар шүүх" className="w-44">
              <SelectValue placeholder="Бүх категори" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх категори</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) =>
              applyPatch({
                q: filters.q ?? "",
                categoryId: filters.categoryId ?? "",
                status: value === "all" ? "" : value,
              })
            }
          >
            <SelectTrigger aria-label="Төлөвөөр шүүх" className="w-40">
              <SelectValue placeholder="Бүх төлөв" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх төлөв</SelectItem>
              <SelectItem value={ProductStatus.AVAILABLE}>Зарагдаагүй</SelectItem>
              <SelectItem value={ProductStatus.SOLD}>Зарагдсан</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild size="icon" variant="outline" aria-label="Шинэ бараа нэмэх">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {deleteError ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {deleteError}
        </p>
      ) : null}

      <div className="rounded-xl border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Бараа</TableHead>
                <TableHead className="hidden md:table-cell">Категори</TableHead>
                <TableHead>Үнэ</TableHead>
                <TableHead className="hidden sm:table-cell">Төлөв</TableHead>
                <TableHead className="hidden lg:table-cell">Онцлох</TableHead>
                <TableHead className="hidden md:table-cell">Нийтэлсэн</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.images[0] ? (
                          <Image
                            src={item.images[0].url}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${item.id}/edit`}
                          className="line-clamp-1 font-medium hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          /{item.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.category.name}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {item.status === ProductStatus.SOLD ? (
                      <Badge variant="destructive">Зарагдсан</Badge>
                    ) : (
                      <Badge variant="success">Зарагдаагүй</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={item.featured ? "Онцлогийг буцаах" : "Онцлох болгох"}
                      disabled={pendingId === item.id}
                      onClick={() =>
                        runAction(item.id, () => toggleProductFeaturedAction(item.id))
                      }
                    >
                      <Star
                        className={
                          item.featured ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"
                        }
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Үзсэн хүний тоог харах"
                        onClick={() => setViewProductId(item.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={
                          item.status === ProductStatus.SOLD
                            ? "Зарагдаагүй болгох"
                            : "Зарагдсан болгох"
                        }
                        disabled={pendingId === item.id}
                        onClick={() =>
                          runAction(item.id, () =>
                            setProductStatusAction(
                              item.id,
                              item.status === ProductStatus.SOLD
                                ? ProductStatus.AVAILABLE
                                : ProductStatus.SOLD
                            )
                          )
                        }
                      >
                        {item.status === ProductStatus.SOLD ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Засах"
                      >
                        <Link href={`/admin/products/${item.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        aria-label="Устгах"
                        disabled={pendingId === item.id}
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Нийт {total} бараа
      </p>

      <Pagination
        basePath="/admin/products"
        params={{
          q: filters.q,
          categoryId: filters.categoryId,
          status: filters.status,
        }}
        page={page}
        totalPages={totalPages}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Энэ барааг устгах уу?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" устгагдсаны дараа сэргээх боломжгүй болно.`
            : undefined
        }
        confirmLabel="Устгах"
        onConfirm={() =>
          runAction(deleteTarget!.id, () => deleteProductAction(deleteTarget!.id))
        }
      />

      <ProductViewStatsDialog
        productId={viewProductId ?? ""}
        productName={viewTarget?.name ?? ""}
        initialTotal={viewTarget?.views?.count ?? 0}
        open={viewProductId !== null}
        onOpenChange={(open) => {
          if (!open) setViewProductId(null);
        }}
      />
    </div>
  );
}