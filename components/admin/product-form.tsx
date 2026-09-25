"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  productFormSchema,
  type ProductFormValues,
  type ProductInput,
} from "@/lib/validations";
import {
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/enums";
import { ImageUploader, type UploadImage } from "@/components/admin/image-uploader";

const CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: "Шинэ",
  LIKE_NEW: "Бараг шинэ",
  USED: "Хуучин",
};

type ProductFormProps = {
  defaultValues: ProductFormValues;
  images: UploadImage[];
  categories: { id: string; name: string }[];
  action: (input: ProductInput) => Promise<{ error?: string } | undefined>;
  submitLabel: string;
  cancelHref: string;
  siteContact?: {
    phone: string | null;
    facebookUrl: string | null;
    messengerUrl: string | null;
  };
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function ProductForm({
  defaultValues,
  images: initialImages,
  categories,
  action,
  submitLabel,
  cancelHref,
  siteContact,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues,
  });

  const [images, setImages] = React.useState<UploadImage[]>(initialImages);
  const [specRows, setSpecRows] = React.useState<
    { key: string; value: string }[]
  >(
    Object.entries(defaultValues.specs ?? {})
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({ key, value: String(value) }))
  );
  const [error, setError] = React.useState<string | null>(null);

  function autofillContact() {
    if (!siteContact) return;
    if (!watch("phone") && siteContact.phone) {
      setValue("phone", siteContact.phone, { shouldValidate: true });
    }
    if (!watch("facebookUrl") && siteContact.facebookUrl) {
      setValue("facebookUrl", siteContact.facebookUrl, { shouldValidate: true });
    }
    if (!watch("messengerUrl") && siteContact.messengerUrl) {
      setValue("messengerUrl", siteContact.messengerUrl, {
        shouldValidate: true,
      });
    }
  }

  async function onSubmit(values: ProductFormValues) {
    const specs: Record<string, string | number | boolean> = {};
    for (const row of specRows) {
      const key = row.key.trim();
      const value = row.value.trim();
      if (!key || !value) continue;
      specs[key] = /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
    }

    const input: ProductInput = {
      ...values,
      specs: Object.keys(specs).length > 0 ? specs : null,
      images: images.map((image) => ({ url: image.url, alt: image.alt ?? null })),
    };

    setError(null);
    const result = await action(input);
    if (result?.error) setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Үндсэн мэдээлэл</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="product-name">Барааны нэр *</Label>
            <Input
              id="product-name"
              {...register("name")}
              placeholder="Жишээ: Apple iPhone 13 Pro 256GB"
              className="mt-2"
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="product-price">Үнэ (₮) *</Label>
              <Input
                id="product-price"
                type="number"
                min={0}
                inputMode="numeric"
                {...register("price")}
                placeholder="2500000"
                className="mt-2"
              />
              <FieldError message={errors.price?.message} />
            </div>
            <div>
              <Label htmlFor="product-location">Байршил</Label>
              <Input
                id="product-location"
                {...register("location")}
                placeholder="УБ, Хан-Уул дүүрэг"
                className="mt-2"
              />
              <FieldError message={errors.location?.message} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="product-category">Категори *</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="product-category" className="mt-2">
                      <SelectValue placeholder="Категори сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.categoryId?.message} />
            </div>
            <div>
              <Label htmlFor="product-condition">Төлөв *</Label>
              <Controller
                control={control}
                name="condition"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="product-condition" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ProductCondition).map((value) => (
                        <SelectItem key={value} value={value}>
                          {CONDITION_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.condition?.message} />
            </div>
            <div>
              <Label htmlFor="product-status">Борлуулалт *</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="product-status" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductStatus.AVAILABLE}>
                        Зарагдаагүй
                      </SelectItem>
                      <SelectItem value={ProductStatus.SOLD}>Зарагдсан</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.status?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="product-description">Тайлбар *</Label>
            <Textarea
              id="product-description"
              rows={6}
              {...register("description")}
              placeholder="Барааны дэлгэрэнгүй мэдээлэл..."
              className="mt-2 resize-y"
            />
            <FieldError message={errors.description?.message} />
          </div>

          <Controller
            control={control}
            name="featured"
            render={({ field }) => (
              <div className="flex items-start gap-2">
                <Checkbox
                  id="product-featured"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                />
                <Label htmlFor="product-featured" className="font-normal">
                  Онцлох бараа болгож нүүр хуудсанд харуулах
                </Label>
              </div>
            )}
          />
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Зураг</h2>
        <ImageUploader value={images} onChange={setImages} />
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Тодорхойлолт (spec)</h2>
        <div className="space-y-2.5">
          {specRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Тодорхойлолт байхгүй байна. Жишээ нь: Хадгалах багтаамж — 256GB.
            </p>
          ) : null}
          {specRows.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                value={row.key}
                placeholder="Нэр (жишээ: Өнгө)"
                aria-label="Тодорхойлолтын нэр"
                onChange={(event) => {
                  const next = [...specRows];
                  next[index] = { ...row, key: event.target.value };
                  setSpecRows(next);
                }}
              />
              <Input
                value={row.value}
                placeholder="Утга (жишээ: Хар)"
                aria-label="Тодорхойлолтын утга"
                onChange={(event) => {
                  const next = [...specRows];
                  next[index] = { ...row, value: event.target.value };
                  setSpecRows(next);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Мөрийг устгах"
                onClick={() => setSpecRows(specRows.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSpecRows([...specRows, { key: "", value: "" }])}
          >
            <Plus className="h-4 w-4" />
            Мөр нэмэх
          </Button>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Холбоо барих</h2>
          {siteContact ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={autofillContact}
            >
              <Sparkles className="h-4 w-4" />
              Авто бөглөх
            </Button>
          ) : null}
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Хэрэв хоосон орхивол сайтын нийт тохиргооны холбоо барих мэдээллийг ашиглана.
        </p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="product-phone">Утасны дугаар</Label>
            <Input
              id="product-phone"
              {...register("phone")}
              placeholder="+976 9911 2233"
              className="mt-2"
            />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="product-facebook">Facebook холбоос</Label>
              <Input
                id="product-facebook"
                type="url"
                {...register("facebookUrl")}
                placeholder="https://facebook.com/yourpage"
                className="mt-2"
              />
              <FieldError message={errors.facebookUrl?.message} />
            </div>
            <div>
              <Label htmlFor="product-messenger">Messenger холбоос</Label>
              <Input
                id="product-messenger"
                type="url"
                {...register("messengerUrl")}
                placeholder="https://m.me/yourusername"
                className="mt-2"
              />
              <FieldError message={errors.messengerUrl?.message} />
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          asChild
          className="sm:ml-auto"
          disabled={isSubmitting}
        >
          <Link href={cancelHref}>Болих</Link>
        </Button>
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