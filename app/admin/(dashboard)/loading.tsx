export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        <span className="text-base font-black text-primary">G</span>
      </span>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Ачааллаж байна...
      </p>
    </div>
  );
}