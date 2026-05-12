"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormikHelpers } from "formik";
import {
  getCurrentUser,
  loginUser,
} from "@/lib/authStorage";
import { hydrateLoggedInUserCart } from "@/lib/cartStorage";
import LoginForm from "@/components/LoginForm/LoginForm";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import { ILoginFormValues } from "@/interfaces/auth.interface";

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

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const nextSafe = useMemo(
    () => safeRedirectPath(searchParams.get("next")),
    [searchParams],
  );

  const registerHref = nextSafe
    ? `/register?next=${encodeURIComponent(nextSafe)}`
    : "/register";

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    router.replace(nextSafe ?? "/profile");
  }, [router, nextSafe]);

  async function handleLogin(
    values: ILoginFormValues,
    { setSubmitting }: FormikHelpers<ILoginFormValues>,
  ) {
    setError("");

    const result = await loginUser(values.email, values.password);
    if (!result.ok) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    await hydrateLoggedInUserCart(result.user.id).catch(() => {});

    if (result.user.role === "admin") {
      router.push("/admin/products");
      setSubmitting(false);
      return;
    }

    router.push(nextSafe ?? "/profile");
    setSubmitting(false);
  }

  return (
    <PageShell>
      <section className={`mx-auto w-full max-w-lg ${PULSE.card} p-6 sm:p-8`}>
        <p className={PULSE.kicker}>PULSE CUENTA DE USUARIO</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Iniciar sesión</h1>
        <p className={`mt-2 text-sm ${PULSE.body}`}>
          Accede a tu cuenta para gestionar tus compras.
        </p>

        <LoginForm onSubmit={handleLogin} externalError={error} />

        <p className={`mt-4 text-sm ${PULSE.body}`}>
          No tienes cuenta?{" "}
          <Link href={registerHref} className={PULSE.link}>
            Registrate
          </Link>
        </p>
      </section>
    </PageShell>
  );
}

function LoginFallback() {
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
