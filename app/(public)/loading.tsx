import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <span className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-black text-primary-foreground">
            G
          </span>
        </span>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Geomax ачааллаж байна...
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="shimmer aspect-square w-full rounded-xl" />
            <Skeleton className="shimmer h-4 w-3/4 rounded-full" />
            <Skeleton className="shimmer h-4 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}