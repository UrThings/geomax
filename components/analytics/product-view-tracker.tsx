"use client";

import * as React from "react";

export function ProductViewTracker({ productId }: { productId: string }) {
  const reported = React.useRef(false);

  React.useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    fetch("/api/stats/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      keepalive: true,
    }).catch(() => {});
  }, [productId]);

  return null;
}