import "server-only";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { IMAGE_MIME_EXT } from "@/lib/constants";

export const LOCAL_UPLOAD_PREFIX = "/uploads/";

const ALLOWED_UPLOAD_EXTENSIONS = new Set<string>(Object.values(IMAGE_MIME_EXT));

export const uploadsDir = path.resolve(process.cwd(), "public", "uploads");

export function localUploadUrl(filename: string) {
  return `${LOCAL_UPLOAD_PREFIX}${filename}`;
}

export function resolveLocalUploadPath(url: string) {
  if (!url.startsWith(LOCAL_UPLOAD_PREFIX)) return null;

  const filename = url.slice(LOCAL_UPLOAD_PREFIX.length);
  if (!filename) return null;
  if (filename.includes("/") || filename.includes("\\") || filename.includes("\0")) return null;
  if (filename === "." || filename === "..") return null;

  // Uploads are always named `${uuid}.${ext}`, so only those extensions are ours to delete.
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(path.extname(filename).toLowerCase())) return null;

  const target = path.resolve(uploadsDir, filename);
  if (path.dirname(target) !== uploadsDir) return null;

  return target;
}

export async function saveLocalUpload(filename: string, data: Buffer) {
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (e) {
    // ignore
  }
  await writeFile(path.join(uploadsDir, filename), data);
  return localUploadUrl(filename);
}

export async function deleteLocalUploads(urls: string[]) {
  const targets = new Set<string>();
  for (const url of urls) {
    const target = resolveLocalUploadPath(url);
    if (target) targets.add(target);
  }

  await Promise.all(
    Array.from(targets).map(async (target) => {
      try {
        await unlink(target);
      } catch {
        // Best-effort: a missing file must never block the DB write.
      }
    })
  );
}
