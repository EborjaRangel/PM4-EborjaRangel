import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell";
import EditarProductosClient from "./EditarProductosClient";

export default function AdminProductsEditarPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <p className="text-sm text-[#65676B]">Cargando…</p>
        </PageShell>
      }
    >
      <EditarProductosClient />
    </Suspense>
  );
}
