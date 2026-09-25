"use client";

import * as React from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Link2,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";

export type UploadImage = { url: string; alt?: string | null };

type ImageUploaderProps = {
  value: UploadImage[];
  onChange: (next: UploadImage[]) => void;
  disabled?: boolean;
};

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? "Зураг хадгалахад алдаа гарлаа.");
  }
  return data.url as string;
}

export function ImageUploader({
  value,
  onChange,
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const valueRef = React.useRef(value);
  React.useEffect(() => {
    valueRef.current = value;
  });
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!uploading && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [uploading]);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const valid = list.filter(
      (file) =>
        ALLOWED_IMAGE_TYPES.includes(file.type) &&
        file.size <= MAX_IMAGE_SIZE
    );
    if (valid.length !== list.length) {
      setError(
        "Зарим файлыг хүлээж аваагүй: зөвхөн JPEG, PNG, WebP, GIF, AVIF формат, 5MB-аас бага хэмжээтэй зураг."
      );
    } else {
      setError(null);
    }
    if (valid.length === 0) return;

    setUploading(true);
    try {
      const next = [...valueRef.current];
      for (const file of valid) {
        const url = await uploadFile(file);
        next.push({ url });
        valueRef.current = next;
        onChange(next);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Алдаа гарлаа.");
    } finally {
      setUploading(false);
    }
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("invalid");
      }
    } catch {
      setError("Хүчинтэй URL оруулна уу.");
      return;
    }
    setError(null);
    onChange([...value, { url }]);
    setUrlInput("");
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, imageIndex) => imageIndex !== index));
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Зураг нэмэх хэсэг"
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled && !uploading && event.dataTransfer.files.length > 0) {
            uploadFiles(event.dataTransfer.files);
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging ? "border-primary bg-primary/5" : "border-input bg-muted/30",
          (disabled || uploading) && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) uploadFiles(event.target.files);
          }}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="mt-3 text-sm font-medium">
          {uploading ? "Зураг хадгалж байна..." : "Зураг чирч оруулах эсвэл товшино уу"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WebP, GIF, AVIF — дээд тал нь 5MB — олон зураг оруулах боломжтой
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="url"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder="Эсвэл зургийн URL оруулах"
            aria-label="Зургийн URL"
            className="pl-9"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addUrl();
              }
            }}
            disabled={disabled || uploading}
          />
        </div>
        <Button type="button" variant="outline" onClick={addUrl} disabled={disabled || uploading}>
          Нэмэх
        </Button>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Зураг жагсаалт">
          {value.map((image, index) => (
            <li
              key={`${image.url}-${index}`}
              className="relative overflow-hidden rounded-lg border bg-muted"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={image.url}
                  alt={`Барааны зураг ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                />
              </div>
              <div className="absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded bg-black/70 px-1 text-xs font-bold text-white">
                {index + 1}
              </div>
              <div className="flex items-center gap-1 p-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Өмнөд нь шилжүүлэх"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Дараад нь шилжүүлэх"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto text-destructive hover:text-destructive"
                  aria-label="Зургийг устгах"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
          <li className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-4 text-xs text-muted-foreground">
            <ImagePlus className="h-6 w-6" />
            <span>{value.length}/20</span>
          </li>
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Дор хаяж нэг зураг оруулахыг зөвлөж байна.
        </p>
      )}
    </div>
  );
}