import { z } from "zod";
import { ProductCondition, ProductStatus } from "@/lib/generated/prisma/enums";

export const signInSchema = z.object({
  email: z.string().trim().email("Хүчинтэй имэйл хаяг оруулна уу."),
  password: z
    .string()
    .trim()
    .min(8, "Нууц үг доод тал нь 8 тэмдэгт байх ёстой."),
});

export type SignInInput = z.infer<typeof signInSchema>;

const urlOrEmpty = (schemeHint: string) =>
  z
    .union([z.literal(""), z.string().trim().url(`${schemeHint} хүчинтэй хаяг байх ёстой.`)])
    .transform((value) => value || null);

const phoneOrEmpty = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(
        /^\+?[0-9][0-9\s()-]{6,18}$/,
        "Хүчинтэй утасны дугаар оруулна уу (жишээ: +976 9911 2233)."
      ),
  ])
  .transform((value) => value || null);

const emailOrEmpty = z
  .union([
    z.literal(""),
    z.string().trim().email("Хүчинтэй имэйл хаяг оруулна уу."),
  ])
  .transform((value) => value || null);

const specValue = z.union([z.string(), z.number(), z.boolean()]);

const productImageUrl = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (value.startsWith("/")) return /^\/[^\s]+$/.test(value);
      try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    "Зургийн URL буруу байна."
  );

export const productImageSchema = z.object({
  url: productImageUrl,
  alt: z.string().trim().max(200).nullable().optional(),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Барааны нэр оруулна уу.")
    .max(200, "Нэр хэт урт байна."),
  slug: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .toLowerCase()
      .max(120)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug нь зөвхөн латин үсэг, тоо, '-' агуулж болно."
      ),
  ]),
  price: z.coerce
    .number("Үнэ оруулна уу.")
    .int("Үнэ бүхэл тоо байх ёстой.")
    .nonnegative("Үнэ сөрөг байж болохгүй."),
  categoryId: z.string().min(1, "Категори сонгоно уу."),
  condition: z.nativeEnum(ProductCondition, "Барааны төлөв сонгоно уу."),
  status: z.nativeEnum(ProductStatus, "Борлуулалтын төлөв сонгоно уу."),
  description: z
    .string()
    .trim()
    .min(10, "Тайлбар дор хаяж 10 тэмдэгт байх ёстой.")
    .max(10000, "Тайлбар хэт урт байна."),
  location: z.union([
    z.literal(""),
    z.string().trim().max(200, "Байршил хэт урт байна."),
  ]),
  phone: phoneOrEmpty,
  facebookUrl: urlOrEmpty("Facebook"),
  messengerUrl: urlOrEmpty("Messenger"),
  featured: z.coerce.boolean(),
  specs: z
    .record(z.string(), specValue)
    .nullable()
    .optional(),
  images: z
    .array(productImageSchema)
    .max(20, "Дээд тал нь 20 зураг.")
    .default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Барааны нэр оруулна уу.")
    .max(200, "Нэр хэт урт байна."),
  slug: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .toLowerCase()
      .max(120)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug нь зөвхөн латин үсэг, тоо, '-' агуулж болно."
      ),
  ]),
  price: z.coerce
    .number("Үнэ оруулна уу.")
    .int("Үнэ бүхэл тоо байх ёстой.")
    .nonnegative("Үнэ сөрөг байж болохгүй."),
  categoryId: z.string().min(1, "Категори сонгоно уу."),
  condition: z.nativeEnum(ProductCondition, "Барааны төлөв сонгоно уу."),
  status: z.nativeEnum(ProductStatus, "Борлуулалтын төлөв сонгоно уу."),
  description: z
    .string()
    .trim()
    .min(10, "Тайлбар дор хаяж 10 тэмдэгт байх ёстой.")
    .max(10000, "Тайлбар хэт урт байна."),
  location: z.string().trim().max(200, "Байршил хэт урт байна."),
  phone: z.string().trim().max(30),
  facebookUrl: z.string().trim().max(500),
  messengerUrl: z.string().trim().max(500),
  featured: z.boolean(),
  specs: z.record(z.string(), specValue).nullable().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Категорийн нэр оруулна уу.")
    .max(100, "Нэр хэт урт байна."),
  slug: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .toLowerCase()
      .max(120)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug нь зөвхөн латин үсэг, тоо, '-' агуулж болно."
      ),
  ]),
  description: z.union([
    z.literal(""),
    z.string().trim().max(500, "Тайлбар хэт урт байна."),
  ]),
  imageUrl: urlOrEmpty("Зургийн"),
  sortOrder: z.coerce
    .number("Дараалал буруу.")
    .int()
    .default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const settingsSchema = z.object({
  ownerName: z
    .string()
    .trim()
    .min(2, "Эзэмшигчийн нэр оруулна уу.")
    .max(100, "Нэр хэт урт байна."),
  siteTitle: z.union([z.literal(""), z.string().trim().max(100)]),
  siteTagline: z.union([z.literal(""), z.string().trim().max(200)]),
  phone: phoneOrEmpty,
  facebookUrl: urlOrEmpty("Facebook"),
  messengerUrl: urlOrEmpty("Messenger"),
  instagramUrl: urlOrEmpty("Instagram"),
  email: emailOrEmpty,
  location: z.union([z.literal(""), z.string().trim().max(200)]),
  bio: z.union([z.literal(""), z.string().trim().max(1000)]),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const specsSchema = z
  .array(
    z.object({
      key: z.string().trim().min(1, "Тодорхойлолтын нэр оруулна уу.").max(100),
      value: z.string().trim().min(1, "Утга оруулна уу.").max(200),
    })
  )
  .max(30);