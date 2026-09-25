"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FolderPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CategoryForm } from "@/components/admin/category-form";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/actions/admin";
import type { CategoryInput } from "@/lib/validations";

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  _count: { products: number };
};

type AdminCategoriesManagerProps = {
  items: AdminCategoryRow[];
};

type EditingState =
  | { mode: "create" }
  | { mode: "edit"; category: AdminCategoryRow }
  | null;

export function AdminCategoriesManager({ items }: AdminCategoriesManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<EditingState>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<AdminCategoryRow | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSave(
    input: CategoryInput
  ): Promise<{ error?: string } | undefined> {
    setError(null);
    const result =
      editing?.mode === "edit"
        ? await updateCategoryAction(editing.category.id, input)
        : await createCategoryAction(input);
    if (result?.error) {
      setError(result.error);
      return result;
    }
    setEditing(null);
    router.refresh();
    return undefined;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <FolderPlus className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Шинэ категори нэмэх</h2>
        </div>
        <div className="mt-4">
          <CategoryForm
            defaultValues={{
              name: "",
              slug: "",
              description: "",
              imageUrl: "",
              sortOrder: String(items.length),
            }}
            action={createCategoryAction}
            submitLabel="Категори нэмэх"
          />
        </div>
      </Card>

      <div className="rounded-xl border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Категори</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Барааны тоо</TableHead>
                <TableHead>Дараалал</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {category.imageUrl ? (
                          <Image
                            src={category.imageUrl}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{category.name}</p>
                        {category.description ? (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {category.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    /{category.slug}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{category._count.products}</Badge>
                  </TableCell>
                  <TableCell>{category.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Засах"
                        onClick={() => setEditing({ mode: "edit", category })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        aria-label="Устгах"
                        onClick={() => setDeleteTarget(category)}
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

      {items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Одоогоор категори байхгүй байна.
        </p>
      ) : null}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.mode === "edit" ? "Категори засах" : "Шинэ категори"}
            </DialogTitle>
            <DialogDescription>
              Категорийн мэдээллийг оруулаад хадгална уу.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <>
              <CategoryForm
                key={editing.mode === "edit" ? editing.category.id : "new"}
                defaultValues={
                  editing.mode === "edit"
                    ? {
                        name: editing.category.name,
                        slug: editing.category.slug,
                        description: editing.category.description ?? "",
                        imageUrl: editing.category.imageUrl ?? "",
                        sortOrder: String(editing.category.sortOrder),
                      }
                    : {
                        name: "",
                        slug: "",
                        description: "",
                        imageUrl: "",
                        sortOrder: String(items.length),
                      }
                }
                action={(input) => handleSave(input)}
                submitLabel={editing.mode === "edit" ? "Хадгалах" : "Нэмэх"}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Категори устгах уу?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" категорийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`
            : undefined
        }
        confirmLabel="Устгах"
        onConfirm={async () => {
          if (!deleteTarget) return;
          setError(null);
          const result = await deleteCategoryAction(deleteTarget.id);
          if (result?.error) {
            setError(result.error);
            return;
          }
          setDeleteTarget(null);
          router.refresh();
        }}
      />
    </div>
  );
}