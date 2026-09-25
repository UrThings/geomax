"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categorySchema, type CategoryInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";

type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: string;
};

type CategoryFormProps = {
  defaultValues: CategoryFormValues;
  action: (input: CategoryInput) => Promise<{ error?: string } | undefined>;
  submitLabel: string;
  cancelHref?: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function CategoryForm({
  defaultValues,
  action,
  submitLabel,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as unknown as Resolver<CategoryFormValues>,
    defaultValues,
  });

  const name = watch("name");
  const [error, setError] = React.useState<string | null>(null);

  function autofillSlug() {
    const generated = slugify(name) || "category";
    if (watch("slug")) return;
    setValue("slug", generated, { shouldValidate: true });
  }

  async function onSubmit(values: CategoryFormValues) {
    const input: CategoryInput = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      imageUrl: values.imageUrl,
      sortOrder: Number(values.sortOrder || 0),
    };
    setError(null);
    const result = await action(input);
    if (result?.error) setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="category-name">Категорийн нэр *</Label>
        <Input
          id="category-name"
          {...register("name")}
          placeholder="Жишээ: Гар утас"
          className="mt-2"
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="category-slug">Slug (URL хаяг)</Label>
        <div className="mt-2 flex gap-2">
          <Input
            id="category-slug"
            {...register("slug")}
            placeholder="gar-utas"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={autofillSlug}
            disabled={!name}
          >
            <Sparkles className="h-4 w-4" />
            Автоматаар
          </Button>
        </div>
        <FieldError message={errors.slug?.message} />
      </div>

      <div>
        <Label htmlFor="category-description">Тайлбар</Label>
        <Textarea
          id="category-description"
          rows={3}
          {...register("description")}
          placeholder="Энэ категорид ямар бараа багтах тайлбарлана уу..."
          className="mt-2"
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div>
        <Label htmlFor="category-image">Зургийн URL</Label>
        <Input
          id="category-image"
          type="url"
          {...register("imageUrl")}
          placeholder="https://..."
          className="mt-2"
        />
        <FieldError message={errors.imageUrl?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category-sort">Дараалал</Label>
          <Input
            id="category-sort"
            type="number"
            {...register("sortOrder")}
            placeholder="Тогоо: 0, 1, 2..."
            className="mt-2"
          />
          <FieldError message={errors.sortOrder?.message} />
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Хадгалж байна...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}