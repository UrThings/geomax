"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <p className="mt-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Алдаа гарлаа
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Ямар нэг зүйл буруу боллоо
      </h1>
      <p className="mt-3 text-muted-foreground">
        Түр зуурын алдаа гарсан байна. Дахин оролдоно уу.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Дахин оролдох</Button>
        <Button variant="outline" asChild>
          <Link href="/">Нүүр хуудас</Link>
        </Button>
      </div>
    </div>
  );
}