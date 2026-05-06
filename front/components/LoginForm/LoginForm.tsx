"use client";

import { FormikHelpers, useFormik } from "formik";
import * as Yup from "yup";
import { ILoginFormValues } from "@/interfaces/auth.interface";
import { PULSE } from "@/lib/pulse";

const initialValues: ILoginFormValues = {
  email: "",
  password: "",
};

const loginValidationSchema: Yup.ObjectSchema<ILoginFormValues> = Yup.object({
  email: Yup.string()
    .trim()
    .email("Ingresa un correo valido.")
    .required("El correo es obligatorio."),
  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .required("La contraseña es obligatoria."),
});

interface LoginFormProps {
  onSubmit: (
    values: ILoginFormValues,
    helpers: FormikHelpers<ILoginFormValues>,
  ) => void | Promise<void>;
  externalError?: string;
}

function LoginForm({ onSubmit, externalError }: LoginFormProps) {
  const formik = useFormik<ILoginFormValues>({
    initialValues,
    validationSchema: loginValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4" noValidate>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
          Correo
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          className={PULSE.input}
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="tu@email.com"
          aria-invalid={Boolean(formik.touched.email && formik.errors.email)}
        />
        {formik.touched.email && formik.errors.email ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
          Contraseña
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className={PULSE.input}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Tu contraseña"
          aria-invalid={Boolean(
            formik.touched.password && formik.errors.password,
          )}
        />
        {formik.touched.password && formik.errors.password ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
        ) : null}
      </label>

      {externalError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {externalError}
        </p>
      ) : null}

      <button
        type="submit"
        className={PULSE.btnPrimaryBlock}
        disabled={formik.isSubmitting || !formik.isValid}
      >
        {formik.isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default LoginForm;
