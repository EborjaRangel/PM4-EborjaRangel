"use client";

import { useEffect, useState } from "react";
import { mockProducts } from "@/data/mockProducts";
import { CATALOG_UPDATED_EVENT, getCatalogProducts } from "@/lib/productCatalog";
import { PULSE } from "@/lib/pulse";

export default function CatalogProductCount() {
  const [count, setCount] = useState(mockProducts.length);

  useEffect(() => {
    const sync = () => setCount(getCatalogProducts().length);
    sync();
    window.addEventListener(CATALOG_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, sync);
  }, []);

  return <span className={PULSE.pill}>{count} productos disponibles</span>;
}
