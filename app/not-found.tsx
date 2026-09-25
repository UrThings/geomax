import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-8 w-8" />
      </span>
      <p className="mt-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Алдаа 404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Хуудас олдсонгүй
      </h1>
      <p className="mt-3 text-muted-foreground">
        Хайж буй хуудас байхгүй эсвэл устгагдсан байна.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Нүүр хуудас руу буцах</Link>
      </Button>
    </div>
  );
}