import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildDailySeries } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "Барааны ID оруулна уу." }, { status: 400 });
    }

    const start = new Date();
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const [rows, view] = await Promise.all([
      prisma.$queryRaw<{ day: Date; count: number }[]>`
        SELECT DATE("createdAt") AS day, COUNT(*)::int AS count
        FROM "StatEvent"
        WHERE "kind" = 'product' AND "productId" = ${productId} AND "createdAt" >= ${start}
        GROUP BY DATE("createdAt")
        ORDER BY day ASC
      `,
      prisma.productView.findUnique({ where: { productId } }),
    ]);

    return NextResponse.json({
      total: view?.count ?? 0,
      daily: buildDailySeries(30, rows),
    });
  } catch (error) {
    console.error("Failed to load product stats:", error);
    return NextResponse.json({ error: "Статистик ачаалахад алдаа гарлаа." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      productId?: string;
    } | null;
    const productId = body?.productId;
    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Барааны ID оруулна уу." }, { status: 400 });
    }

    await Promise.all([
      prisma.productView.upsert({
        where: { productId },
        update: { count: { increment: 1 } },
        create: { productId, count: 1 },
      }),
      prisma.statEvent.create({
        data: { kind: "product", productId },
      }),
    ]);

    const view = await prisma.productView.findUnique({ where: { productId } });
    return NextResponse.json({ count: view?.count ?? 1 });
  } catch (error) {
    console.error("Failed to record product view:", error);
    return NextResponse.json({ error: "Бүртгэхэд алдаа гарлаа." }, { status: 500 });
  }
}