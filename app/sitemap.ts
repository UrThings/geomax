import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/products`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
  ];

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5000,
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    entries.push(
      ...products.map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: product.updatedAt,
      })),
      ...categories.map((category) => ({
        url: `${siteUrl}/category/${category.slug}`,
        lastModified: category.updatedAt,
      }))
    );
  } catch {
    // Database may be unavailable during build; static routes are still returned.
  }

  return entries;
}