import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  ProductCondition,
  ProductStatus,
} from "@/lib/generated/prisma/enums";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  ADMIN_PAGE_SIZE,
  PUBLIC_PAGE_SIZE,
} from "@/lib/constants";

const productListSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  condition: true,
  status: true,
  location: true,
  featured: true,
  createdAt: true,
  phone: true,
  facebookUrl: true,
  messengerUrl: true,
  category: { select: { name: true, slug: true } },
  images: {
    select: { id: true, url: true, alt: true },
    orderBy: { sortOrder: "asc" as const },
    take: 1,
  },
} satisfies Prisma.ProductSelect;

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  condition: ProductCondition;
  status: ProductStatus;
  location: string | null;
  featured: boolean;
  createdAt: Date;
  phone: string | null;
  facebookUrl: string | null;
  messengerUrl: string | null;
  category: { name: string; slug: string };
  images: { id: string; url: string; alt: string | null }[];
};

export type ProductListParams = {
  q?: string;
  categorySlug?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  condition?: ProductCondition | null;
  status?: ProductStatus | null;
  featured?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
};

function buildWhere(params: ProductListParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (params.featured) {
    where.featured = true;
  }
  if (params.categorySlug) {
    where.category = { slug: params.categorySlug };
  }
  if (params.condition) {
    where.condition = params.condition;
  }
  if (params.status) {
    where.status = params.status;
  }
  if (params.priceMin != null || params.priceMax != null) {
    where.price = {};
    if (params.priceMin != null) {
      where.price.gte = params.priceMin;
    }
    if (params.priceMax != null) {
      where.price.lte = params.priceMax;
    }
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      {
        category: {
          name: { contains: params.q, mode: "insensitive" },
        },
      },
    ];
  }
  return where;
}

function buildSort(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price_desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "name_asc":
      return [{ name: "asc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function getPublicProducts(
  params: ProductListParams = {}
) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    48,
    Math.max(1, params.pageSize ?? PUBLIC_PAGE_SIZE)
  );
  const where = buildWhere(params);
  const orderBy = buildSort(params.sort);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productListSelect,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export const getHomeProducts = cache(async () => {
  const [latest, featured] = await Promise.all([
    prisma.product.findMany({
      where: { status: ProductStatus.AVAILABLE },
      select: productListSelect,
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.product.findMany({
      where: { status: ProductStatus.AVAILABLE, featured: true },
      select: productListSelect,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  return { latest, featured };
});

export const getCategories = cache(async () => {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: { where: { status: ProductStatus.AVAILABLE } },
        },
      },
    },
  });
});

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getAdminProducts(params: {
  q?: string;
  categoryId?: string;
  status?: ProductStatus | null;
  page?: number;
}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = ADMIN_PAGE_SIZE;
  const where: Prisma.ProductWhereInput = {};

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { slug: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }
  if (params.status) {
    where.status = params.status;
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        status: true,
        featured: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        images: {
          select: { url: true, alt: true },
          orderBy: { sortOrder: "asc" as const },
          take: 1,
        },
        views: { select: { count: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export const getAdminStats = cache(async () => {
  const [total, available, sold, featured, categoryCount, siteStat] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: ProductStatus.AVAILABLE } }),
      prisma.product.count({ where: { status: ProductStatus.SOLD } }),
      prisma.product.count({ where: { featured: true } }),
      prisma.category.count(),
      prisma.siteStat.findUnique({ where: { id: 1 } }),
    ]);
  return {
    total,
    available,
    sold,
    featured,
    categoryCount,
    siteViews: siteStat?.siteViews ?? 0,
  };
});

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getAllCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });
}

export type CategoryWithCount = Awaited<
  ReturnType<typeof getAllCategoriesForAdmin>
>[number];

type DailyRow = { day: Date | string; count: number };

export type DailyStat = {
  date: string;
  label: string;
  count: number;
};

export function buildDailySeries(days: number, rows: DailyRow[]): DailyStat[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(String(row.day).slice(0, 10), row.count);
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  const series: DailyStat[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    series.push({
      date: key,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      count: map.get(key) ?? 0,
    });
  }
  return series;
}

export async function getDashboardStats() {
  const start = new Date();
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const [siteRows, productRows, siteStat] = await Promise.all([
    prisma.$queryRaw<
      Array<{ day: Date; count: number }>
    >`SELECT DATE("createdAt") AS day, COUNT(*)::int AS count FROM "StatEvent" WHERE "kind" = 'site' AND "createdAt" >= ${start} GROUP BY DATE("createdAt") ORDER BY day ASC`,
    prisma.$queryRaw<
      Array<{ day: Date; count: number }>
    >`SELECT DATE("createdAt") AS day, COUNT(*)::int AS count FROM "StatEvent" WHERE "kind" = 'product' AND "createdAt" >= ${start} GROUP BY DATE("createdAt") ORDER BY day ASC`,
    prisma.siteStat.findUnique({ where: { id: 1 } }),
  ]);

  return {
    siteViews: siteStat?.siteViews ?? 0,
    siteDaily: buildDailySeries(30, siteRows),
    productDaily: buildDailySeries(30, productRows),
  };
}