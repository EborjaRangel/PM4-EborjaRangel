"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/authStorage";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    const result = registerUser(fullName, email, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push("/profile");
  }

  return (
    <PageShell>
      <section className={`mx-auto w-full max-w-lg ${PULSE.card} p-8`}>
        <p className={PULSE.kicker}>PULSE ACCOUNT</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Crear cuenta</h1>
        <p className={`mt-2 text-sm ${PULSE.body}`}>
          Registra tus datos para comprar en PULSE.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
              Nombre completo
            </span>
            <input
              className={PULSE.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Juan Perez"
            />
          </label>

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
              placeholder="Minimo 6 caracteres"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
              Confirmar contrasena
            </span>
            <input
              type="password"
              className={PULSE.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contrasena"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button type="submit" className={PULSE.btnPrimaryBlock}>
            Registrarme
          </button>
        </form>

        <p className={`mt-4 text-sm ${PULSE.body}`}>
          Ya tienes cuenta?{" "}
          <Link href="/login" className={PULSE.link}>
            Inicia sesion
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
