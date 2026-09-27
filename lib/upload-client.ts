export type UploadResult = {
  url: string;
  storage: "blob" | "local";
};

export async function uploadImageFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "Зураг хадгалахад алдаа гарлаа.");
  }
  if (!data?.url) {
    throw new Error("Зургийн хаяг авах боломжгүй байлаа.");
  }
  return data as UploadResult;
}
