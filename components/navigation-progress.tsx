"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle");
  const [progress, setProgress] = React.useState(0);
  const loadingRef = React.useRef(false);
  const finishTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = React.useRef(0);

  const reset = React.useCallback(() => {
    loadingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (finishTimer.current) clearTimeout(finishTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    setState("idle");
    setProgress(0);
  }, []);

  const finish = React.useCallback(() => {
    if (!loadingRef.current) return;
    loadingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (finishTimer.current) clearTimeout(finishTimer.current);
    setState("done");
    setProgress(100);
    finishTimer.current = setTimeout(() => {
      setState("idle");
      setProgress(0);
    }, 300);
  }, []);

  React.useEffect(() => {
    const advance = () => {
      setProgress((p) => {
        const target = 90;
        const next = p + Math.max(1.2, (target - p) * 0.14);
        return Math.min(next, target);
      });
      rafRef.current = requestAnimationFrame(advance);
    };

    const start = () => {
      if (finishTimer.current) clearTimeout(finishTimer.current);
      loadingRef.current = true;
      setState("loading");
      setProgress(6);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(advance);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("//")) return;
      if (!href.startsWith("/")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.origin && anchor.origin !== window.location.origin) return;
      if (anchor.href === window.location.href) return;

      start();
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      cancelAnimationFrame(rafRef.current);
      if (finishTimer.current) clearTimeout(finishTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  React.useEffect(() => {
    if (state !== "loading") return;
    safetyTimer.current = setTimeout(() => {
      if (loadingRef.current) reset();
    }, 8000);
    return () => {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, [state, reset]);

  React.useEffect(() => {
    if (loadingRef.current) finish();
  }, [pathname, finish]);

  if (state === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
    >
      <div className="np-bar h-full" style={{ width: `${progress}%` }} />
    </div>
  );
}