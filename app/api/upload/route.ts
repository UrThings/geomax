import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  IMAGE_MIME_EXT,
} from "@/lib/constants";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const authenticated = await isAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB" },
      { status: 400 }
    );
  }

  const extension = IMAGE_MIME_EXT[file.type] ?? ".png";
  const filename = `${crypto.randomUUID()}${extension}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageToCloudinary(buffer, filename);
    return NextResponse.json({ url, storage: "cloudinary" });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
