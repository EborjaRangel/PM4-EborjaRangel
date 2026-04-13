"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  logoutUser,
  updateCurrentUserPassword,
} from "@/lib/authStorage";
import { PublicUser } from "@/interfaces/auth.interface";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setUser(getCurrentUser());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push("/login");
    }
  }, [router, user, mounted]);

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Completa todos los campos para cambiar la contrasena.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La nueva contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("La confirmacion no coincide con la nueva contrasena.");
      return;
    }

    const result = updateCurrentUserPassword(currentPassword, newPassword);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess("Contrasena actualizada correctamente.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }

  if (!user) {
    return (
      <PageShell>
        <p className={`text-center ${PULSE.body}`}>Cargando perfil...</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="grid gap-6 lg:grid-cols-2">
        <article className={`${PULSE.card} p-8`}>
          <p className={PULSE.kicker}>MI PERFIL</p>
          <h1 className={`mt-2 ${PULSE.h1}`}>Datos del usuario</h1>

          <div className="mt-6 space-y-4">
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Nombre completo</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">
                {user.fullName}
              </p>
            </div>
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Correo</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">{user.email}</p>
            </div>
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Registro</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Veces que has ingresado</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">
                {user.loginCount}
              </p>
            </div>
            <div className={PULSE.surfaceMuted}>
              <p className="text-xs text-[#65676B]">Ultimo acceso</p>
              <p className="mt-1 font-semibold text-[#1C1E21]">
                {new Date(user.lastLoginAt).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={`mt-6 ${PULSE.btnGhost}`}
          >
            Cerrar sesion
          </button>
        </article>

        <article className={`${PULSE.card} p-8`}>
          <p className={PULSE.kicker}>SEGURIDAD</p>
          <h2 className="mt-2 text-2xl font-bold text-[#1C1E21]">
            Cambiar contrasena
          </h2>

          <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
                Contrasena actual
              </span>
              <input
                type="password"
                className={PULSE.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
                Nueva contrasena
              </span>
              <input
                type="password"
                className={PULSE.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
                Confirmar nueva contrasena
              </span>
              <input
                type="password"
                className={PULSE.input}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}

            <button type="submit" className={PULSE.btnPrimaryBlock}>
              Guardar nueva contrasena
            </button>
          </form>
        </article>
      </section>
    </PageShell>
  );
}
