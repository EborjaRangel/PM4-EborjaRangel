"use client";

import { useEffect } from "react";
import { AUTH_CHANGED_EVENT, getCurrentUser } from "@/lib/authStorage";
import { hydrateLoggedInUserCart } from "@/lib/cartStorage";

/**
 * Usuarios logueados: sincroniza carrito con el servidor (otros dispositivos).
 * Invitados: no hace nada (su carrito sigue solo en localStorage).
 */
export default function CartRemoteHydrate() {
  useEffect(() => {
    const sync = () => {
      const user = getCurrentUser();
      if (!user) return;
      void hydrateLoggedInUserCart(user.id);
    };

    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync);
  }, []);

  return null;
}
