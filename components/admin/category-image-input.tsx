"use client";

import * as React from "react";
import { Link2, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { uploadImageFile } from "@/lib/upload-client";

type CategoryImageInputProps = {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  disabled?: boolean;
};

const ACCEPTED = ALLOWED_IMAGE_TYPES.join(",");

export function CategoryImageInput({
  value,
  onChange,
  error,
  disabled = false,
}: CategoryImageInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [urlInput, setUrlInput] = React.useState("");

  React.useEffect(() => {
    if (!uploading && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [uploading]);

  const locked = disabled || uploading;

  async function handleFile(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Зөвхөн JPEG, PNG, WebP, GIF, AVIF форматтай зураг оруулна уу.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError("Зургийн хэмжээ 5MB-аас ихгүй байх ёстой.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadImageFile(file);
      onChange(result.url);
      setUrlInput("");
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Зураг хадгалахад алдаа гарлаа."
      );
    } finally {
      setUploading(false);
    }
  }

  function applyUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith("/")) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          setUploadError("Зөвхөн http эсвэл https хаяг оруулна уу.");
          return;
        }
      } catch {
        setUploadError("Хүчинтэй URL оруулна уу.");
        return;
      }
    } else if (/\s/.test(url)) {
      setUploadError("Хүчинтэй URL оруулна уу.");
      return;
    }

    setUploadError(null);
    onChange(url);
    setUrlInput("");
  }

  const message = error ?? uploadError;

  return (
    <div className="space-y-3">
      <Label htmlFor="category-image">Зураг</Label>

      {value ? (
        <div className="flex items-center gap-3">
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- preview must render arbitrary admin-entered URLs, which next/image rejects unless allowlisted */}
            <img
              src={value}
              alt="Категорийн зураг"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="truncate text-xs text-muted-foreground">{value}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => !locked && inputRef.current?.click()}
                disabled={locked}
              >
                <UploadCloud className="h-4 w-4" />
                Солих
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onChange("")}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
                Устгах
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Зураг оруулах"
          onClick={() => !locked && inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (!locked) inputRef.current?.click();
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
            const file = event.dataTransfer.files[0];
            if (file && !locked) void handleFile(file);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dragging ? "border-primary bg-primary/5" : "border-input bg-muted/30",
            locked && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm font-medium">
            {uploading ? "Зураг хадгалж байна..." : "Зураг чирч эсвэл товшино уу"}
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, GIF, AVIF — 5MB-аас бага
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="category-image-url"
            type="url"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyUrl();
              }
            }}
            placeholder="Эсвэл зургийн URL оруулах"
            aria-label="Зургийн URL"
            className="pl-9"
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={applyUrl}
          disabled={disabled || urlInput.trim().length === 0}
        >
          Оруулах
        </Button>
      </div>

      {message ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}
