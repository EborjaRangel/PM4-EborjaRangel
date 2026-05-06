"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormikHelpers } from "formik";
import { getCurrentUser, loginUser } from "@/lib/authStorage";
import { hydrateLoggedInUserCart } from "@/lib/cartStorage";
import LoginForm from "@/components/LoginForm/LoginForm";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import { ILoginFormValues } from "@/interfaces/auth.interface";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      router.replace("/profile");
    }
  }, [router]);

  async function handleLogin(
    values: ILoginFormValues,
    { setSubmitting }: FormikHelpers<ILoginFormValues>,
  ) {
    setError("");

    const result = loginUser(values.email, values.password);
    if (!result.ok) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    await hydrateLoggedInUserCart(result.user.id);

    if (result.user.role === "admin") {
      router.push("/admin/products");
      setSubmitting(false);
      return;
    }

    router.push("/profile");
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
          <Link href="/register" className={PULSE.link}>
            Registrate
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
