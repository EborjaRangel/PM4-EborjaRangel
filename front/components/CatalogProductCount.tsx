"use client";

import { useCallback, useEffect, useState } from "react";
import { CATALOG_UPDATED_EVENT, fetchProducts } from "@/lib/productCatalog";
import { PULSE } from "@/lib/pulse";

export default function CatalogProductCount() {
  const [count, setCount] = useState<number | null>(null);

  const sync = useCallback(async () => {
    try {
      const list = await fetchProducts();
      setCount(list.length);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(CATALOG_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, sync);
  }, [sync]);

  return (
    <span className={PULSE.pill}>
      {count === null ? "…" : count} productos disponibles
    </span>
  );
}
