import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const [stat] = await Promise.all([
      prisma.siteStat.upsert({
        where: { id: 1 },
        update: { siteViews: { increment: 1 } },
        create: { id: 1, siteViews: 1 },
      }),
      prisma.statEvent.create({ data: { kind: "site" } }),
    ]);
    return NextResponse.json({ count: stat.siteViews });
  } catch (error) {
    console.error("Failed to record site view:", error);
    return NextResponse.json({ error: "Бүртгэхэд алдаа гарлаа." }, { status: 500 });
  }
}