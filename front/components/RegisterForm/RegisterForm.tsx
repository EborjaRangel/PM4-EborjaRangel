"use client";

import { FormikHelpers, useFormik } from "formik";
import * as Yup from "yup";
import { IRegisterFormValues } from "@/interfaces/auth.interface";
import {
  deliveryAddressYup,
  deliveryPhoneYup,
} from "@/lib/deliveryContact.validation";
import { PULSE } from "@/lib/pulse";

const initialValues: IRegisterFormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  phone: "",
};

const registerValidationSchema: Yup.ObjectSchema<IRegisterFormValues> =
  Yup.object({
    fullName: Yup.string()
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres.")
      .max(60, "El nombre es demasiado largo.")
      .required("El nombre es obligatorio."),
    email: Yup.string()
      .trim()
      .email("Ingresa un correo valido.")
      .required("El correo es obligatorio."),
    password: Yup.string()
      .min(6, "La contraseña debe tener al menos 6 caracteres.")
      .required("La contraseña es obligatoria."),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Las contraseñas no coinciden.")
      .required("Confirma tu contraseña."),
    address: deliveryAddressYup,
    phone: deliveryPhoneYup,
  });

interface RegisterFormProps {
  onSubmit: (
    values: IRegisterFormValues,
    helpers: FormikHelpers<IRegisterFormValues>,
  ) => void | Promise<void>;
  externalError?: string;
}

function RegisterForm({ onSubmit, externalError }: RegisterFormProps) {
  const formik = useFormik<IRegisterFormValues>({
    initialValues,
    validationSchema: registerValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4" noValidate>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
          Nombre completo
        </span>
        <input
          name="fullName"
          type="text"
          autoComplete="name"
          className={PULSE.input}
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Ej. Edgar Borja"
          aria-invalid={Boolean(
            formik.touched.fullName && formik.errors.fullName,
          )}
        />
        {formik.touched.fullName && formik.errors.fullName ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.fullName}</p>
        ) : null}
      </label>

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
          Direccion
        </span>
        <input
          name="address"
          type="text"
          autoComplete="street-address"
          className={PULSE.input}
          value={formik.values.address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Ej. Av. Reforma 123, Col. Centro"
          aria-invalid={Boolean(
            formik.touched.address && formik.errors.address,
          )}
        />
        {formik.touched.address && formik.errors.address ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.address}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
          Telefono
        </span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={22}
          className={PULSE.input}
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="9 a 15 dígitos (ej. 5512345678)"
          aria-invalid={Boolean(formik.touched.phone && formik.errors.phone)}
        />
        {formik.touched.phone && formik.errors.phone ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
          Contraseña
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          className={PULSE.input}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Minimo 6 caracteres"
          aria-invalid={Boolean(
            formik.touched.password && formik.errors.password,
          )}
        />
        {formik.touched.password && formik.errors.password ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
          Confirmar contraseña
        </span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={PULSE.input}
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Repite tu contraseña"
          aria-invalid={Boolean(
            formik.touched.confirmPassword && formik.errors.confirmPassword,
          )}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
          <p className="mt-1 text-sm text-red-600">
            {formik.errors.confirmPassword}
          </p>
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
        className={`${PULSE.btnPrimaryBlock} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={formik.isSubmitting || !formik.isValid}
      >
        {formik.isSubmitting ? "Registrando..." : "Registrarme"}
      </button>
    </form>
  );
}

export default RegisterForm;
