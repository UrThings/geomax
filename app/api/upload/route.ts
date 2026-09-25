import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, IMAGE_MIME_EXT } from "@/lib/constants";

export async function POST(request: Request) {
  const authenticated = await isAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй хүсэлт." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL) {
    return NextResponse.json(
      { error: "Vercel Blob тохируулаагүй байна. BLOB_READ_WRITE_TOKEN орчуулаг өгнө үү." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Зураг хавсаргаагүй байна." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Зөвхөн JPEG, PNG, WebP, GIF, AVIF форматын зураг хүлээн авна." },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "Зургийн хэмжээ 5MB-аас ихгүй байх ёстой." },
      { status: 400 }
    );
  }

  const extension = IMAGE_MIME_EXT[file.type] ?? "png";
  const filename = `${crypto.randomUUID()}.${extension}`;

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, file, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: true,
      });
      return NextResponse.json({ url: blob.url });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: "Зургийг хадгалахад алдаа гарлаа." },
      { status: 500 }
    );
  }
}