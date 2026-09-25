"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    fetch("/api/stats/site", { method: "POST", keepalive: true }).catch(() => {});
  }, [pathname]);

  return null;
}