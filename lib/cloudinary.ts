import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(
  buffer: Buffer,
  filename: string
) {
  try {
    const base64 = buffer.toString("base64");
    const ext = filename.split(".").pop()?.toLowerCase() || "png";

    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      avif: "image/avif",
    };

    const mimeType = mimeTypes[ext] || "image/png";

    const dataUri = `data:${mimeType};base64,${base64}`;

    console.log("Cloudinary config:", {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: filename.replace(/\.[^.]+$/, ""),
      folder: "geomax",
      resource_type: "image",
    });

    console.log("Cloudinary upload success:", {
      public_id: result.public_id,
      secure_url: result.secure_url,
    });

    return result.secure_url;
  } catch (error: any) {
    console.error("========== CLOUDINARY ERROR ==========");
    console.error("name:", error?.name);
    console.error("message:", error?.message);
    console.error("http_code:", error?.http_code);
    console.error("error:", error?.error);
    console.error("full:", error);
    console.error("======================================");

    throw error;
  }
}

export const cloudinaryClient = cloudinary;
