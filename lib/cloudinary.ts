import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(buffer: Buffer, filename: string) {
  const base64 = buffer.toString("base64");
  const ext = filename.split(".").pop() || "png";
  const dataUri = `data:image/${ext};base64,${base64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: filename.replace(/\.[^.]+$/, ""),
    folder: "geomax",
    resource_type: "image",
  });
  return result.secure_url as string;
}

export const cloudinaryClient = cloudinary;
