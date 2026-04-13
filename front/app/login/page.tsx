"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, loginUser } from "@/lib/authStorage";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      router.replace("/profile");
    }
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Ingresa correo y contrasena.");
      return;
    }

    const result = loginUser(email, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (result.user.role === "admin") {
      router.push("/admin/products");
      return;
    }

    router.push("/profile");
  }

  return (
    <PageShell>
      <section className={`mx-auto w-full max-w-lg ${PULSE.card} p-8`}>
        <p className={PULSE.kicker}>PULSE ACCOUNT</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Iniciar sesion</h1>
        <p className={`mt-2 text-sm ${PULSE.body}`}>
          Accede a tu cuenta para gestionar tus compras.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
              Correo
            </span>
            <input
              type="email"
              className={PULSE.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
              Contrasena
            </span>
            <input
              type="password"
              className={PULSE.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contrasena"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button type="submit" className={PULSE.btnPrimaryBlock}>
            Entrar
          </button>
        </form>

        <p className={`mt-4 text-sm ${PULSE.body}`}>
          No tienes cuenta?{" "}
          <Link href="/register" className={PULSE.link}>
            Registrate
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
