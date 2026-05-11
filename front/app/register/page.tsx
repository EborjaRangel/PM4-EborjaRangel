"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormikHelpers } from "formik";
import { registerUser } from "@/lib/authStorage";
import { hydrateLoggedInUserCart } from "@/lib/cartStorage";
import RegisterForm from "@/components/RegisterForm/RegisterForm";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import { IRegisterFormValues } from "@/interfaces/auth.interface";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

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

    router.push("/profile");
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
          <Link href="/login" className={PULSE.link}>
            Inicia sesión
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
