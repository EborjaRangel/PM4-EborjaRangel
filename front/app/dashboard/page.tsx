"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiUserRecordToPublicUser,
  BUILT_IN_ADMIN_EMAIL,
  getCurrentUser,
} from "@/lib/authStorage";
import { fetchAllUsersAdmin } from "@/lib/authApi";
import { PublicUser } from "@/interfaces/auth.interface";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);

  useEffect(() => {
    let cancelled = false;
    setMounted(true);

    async function bootstrap() {
      const me = getCurrentUser();
      if (cancelled) return;
      setCurrentUser(me);
      if (!me) return;

      if (me.role === "admin") {
        try {
          const res = await fetchAllUsersAdmin();
          if (cancelled) return;
          const rows = Array.isArray(res.data) ? res.data : [];
          setUsers(rows.map((r) => apiUserRecordToPublicUser(r as Record<string, unknown>)));
        } catch {
          if (!cancelled) setUsers([me]);
        }
      } else {
        setUsers([me]);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!currentUser) {
      router.replace("/login");
    }
  }, [router, currentUser, mounted]);

  const visibleUsers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return users;
    return users.filter((u) => u.id === currentUser.id);
  }, [users, currentUser]);

  const mostActiveUser = useMemo(() => {
    if (!visibleUsers.length) return null;
    return [...visibleUsers].sort((a, b) => b.loginCount - a.loginCount)[0];
  }, [visibleUsers]);

  const isAdmin = currentUser?.role === "admin";

  if (!mounted || !currentUser) {
    return (
      <PageShell>
        <p className={`text-center ${PULSE.body}`}>Cargando dashboard...</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className={`${PULSE.card} p-6 sm:p-8`}>
        <p className={PULSE.kicker}>
          {isAdmin ? "ADMIN PANEL" : "TU RESUMEN"}
        </p>
        <h1 className={`mt-2 ${PULSE.h1}`}>
          {isAdmin ? "Dashboard de usuarios" : "Tu dashboard"}
        </h1>
        <p className={`mt-2 text-sm ${PULSE.body}`}>
          {isAdmin ? (
            <>
              Lista de cuentas almacenadas en Postgres. Si arrancas la API por primera vez puede
              crearse automáticamente una cuenta demo de administración:{" "}
              <span className="font-mono text-[#1C1E21]">
                {BUILT_IN_ADMIN_EMAIL}
              </span>
              .
            </>
          ) : (
            <>
              Solo ves tus propios datos de cuenta. Los administradores ven el listado completo desde el servidor.
            </>
          )}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className={PULSE.surfaceMuted}>
            <p className="text-xs text-[#65676B]">
              {isAdmin ? "Usuarios registrados" : "Cuentas visibles"}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#1C1E21]">
              {visibleUsers.length}
            </p>
          </article>
          <article className={PULSE.surfaceMuted}>
            <p className="text-xs text-[#65676B]">Usuario en sesión</p>
            <p className="mt-1 font-semibold text-[#1C1E21]">
              {currentUser.fullName}
            </p>
            <p className="text-sm text-[#65676B]">{currentUser.email}</p>
          </article>
          <article className={PULSE.surfaceMuted}>
            <p className="text-xs text-[#65676B]">Usuario más activo</p>
            <p className="mt-1 font-semibold text-[#1C1E21]">
              {mostActiveUser ? mostActiveUser.fullName : "Sin datos"}
            </p>
            <p className="text-sm text-[#65676B]">
              {mostActiveUser
                ? `${mostActiveUser.loginCount} inicios de sesión`
                : ""}
            </p>
          </article>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#1877F2]/12">
          <table className="w-full border-collapse text-left text-sm">
            <thead className={PULSE.tableHead}>
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Login count</th>
                <th className="px-4 py-3 font-semibold">Último acceso</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const isCurrent = user.id === currentUser.id;
                return (
                  <tr
                    key={user.id}
                    className={`border-t border-[#1877F2]/10 ${
                      isCurrent ? "bg-[#E7F3FF]/60" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-[#1C1E21]">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-3 text-[#65676B]">{user.email}</td>
                    <td className="px-4 py-3 text-[#65676B]">
                      {user.loginCount}
                    </td>
                    <td className="px-4 py-3 text-[#65676B]">
                      {new Date(user.lastLoginAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {isCurrent ? (
                        <span className="rounded-full bg-[#1877F2]/15 px-3 py-1 text-xs font-semibold text-[#1877F2]">
                          Sesión activa
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#F0F2F5] px-3 py-1 text-xs font-semibold text-[#65676B]">
                          Inactivo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
