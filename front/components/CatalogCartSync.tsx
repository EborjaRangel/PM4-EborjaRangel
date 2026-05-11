"use client";

import { useEffect } from "react";
import { pruneCartAgainstCatalog } from "@/lib/cartStorage";
import { CATALOG_UPDATED_EVENT } from "@/lib/productCatalog";

/** Cuando el catálogo cambia (alta/baja), elimina del carrito líneas de productos que ya no existen. */
export default function CatalogCartSync() {
  useEffect(() => {
    const run = () => {
      void pruneCartAgainstCatalog();
    };
    run();
    window.addEventListener(CATALOG_UPDATED_EVENT, run);
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, run);
  }, []);

  return null;
}
