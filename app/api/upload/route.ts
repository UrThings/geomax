import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, IMAGE_MIME_EXT } from "@/lib/constants";
import { saveLocalUpload } from "@/lib/storage";

export async function POST(request: Request) {
  const authenticated = await isAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Зөвшөөрөлгүй хүсэлт." }, { status: 401 });
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

  // IMAGE_MIME_EXT values already include the leading dot.
  const extension = IMAGE_MIME_EXT[file.type] ?? ".png";
  const filename = `${crypto.randomUUID()}${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(filename, file, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: true,
      });
      return NextResponse.json({ url: blob.url, storage: "blob" });
    } catch (error) {
      console.error("Vercel Blob upload failed, falling back to local storage:", error);
    }
  }

  try {
    const url = await saveLocalUpload(filename, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url, storage: "local" });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: "Зургийг хадгалахад алдаа гарлаа." },
      { status: 500 }
    );
  }
}