"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormikHelpers } from "formik";
import { registerUser } from "@/lib/authStorage";
import { hydrateLoggedInUserCart } from "@/lib/cartStorage";
import RegisterForm from "@/components/RegisterForm/RegisterForm";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import { IRegisterFormValues } from "@/interfaces/auth.interface";

function safeRedirectPath(raw: string | null): string | null {
  if (raw == null) return null;
  let t = raw.trim();
  try {
    t = decodeURIComponent(t);
  } catch {
    return null;
  }
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  return t;
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const nextSafe = useMemo(
    () => safeRedirectPath(searchParams.get("next")),
    [searchParams],
  );

  const loginHref = nextSafe
    ? `/login?next=${encodeURIComponent(nextSafe)}`
    : "/login";

  async function handleRegister(
    values: IRegisterFormValues,
    { setSubmitting }: FormikHelpers<IRegisterFormValues>,
  ) {
    setError("");

    const result = await registerUser(
      values.fullName,
      values.email,
      values.password,
      values.address,
      values.phone,
    );
    if (!result.ok) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    await hydrateLoggedInUserCart(result.user.id).catch(() => {});

    router.push(nextSafe ?? "/profile");
    setSubmitting(false);
  }

  return (
    <PageShell>
      <section className={`mx-auto w-full max-w-lg ${PULSE.card} p-6 sm:p-8`}>
        <p className={PULSE.kicker}>PULSE CUENTA DE USUARIO</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Crear cuenta</h1>
        <p className={`mt-2 text-sm ${PULSE.body}`}>
          Registra tus datos para comprar en PULSE.
        </p>

        <RegisterForm onSubmit={handleRegister} externalError={error} />

        <p className={`mt-4 text-sm ${PULSE.body}`}>
          Ya tienes cuenta?{" "}
          <Link href={loginHref} className={PULSE.link}>
            Inicia sesión
          </Link>
        </p>
      </section>
    </PageShell>
  );
}

function RegisterFallback() {
  return (
    <PageShell>
      <section className={`mx-auto w-full max-w-lg ${PULSE.card} p-6 sm:p-8`}>
        <p className={`text-center text-sm ${PULSE.body} text-[#65676B]`}>
          Cargando…
        </p>
      </section>
    </PageShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterPageContent />
    </Suspense>
  );
}
