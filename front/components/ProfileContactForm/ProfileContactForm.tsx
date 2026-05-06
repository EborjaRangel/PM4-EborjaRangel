"use client";

import { FormikHelpers, useFormik } from "formik";
import { updateCurrentUserContact } from "@/lib/authStorage";
import type { IContactDeliveryFormValues } from "@/interfaces/auth.interface";
import {
  deliveryContactValidationSchema,
  normalizePhoneDigits,
} from "@/lib/deliveryContact.validation";
import { PULSE } from "@/lib/pulse";

interface ProfileContactFormProps {
  initialAddress: string;
  initialPhone: string;
}

export default function ProfileContactForm({
  initialAddress,
  initialPhone,
}: ProfileContactFormProps) {
  const formik = useFormik<IContactDeliveryFormValues>({
    enableReinitialize: true,
    initialValues: {
      address: initialAddress,
      phone: initialPhone,
    },
    validationSchema: deliveryContactValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (
      values,
      { setSubmitting, setStatus }: FormikHelpers<IContactDeliveryFormValues>,
    ) => {
      setStatus(undefined);
      const result = updateCurrentUserContact(
        values.address.trim(),
        normalizePhoneDigits(values.phone),
      );
      setSubmitting(false);
      if (!result.ok) {
        setStatus(result.message);
        return;
      }
      setStatus({ ok: "Dirección y teléfono guardados." });
    },
  });

  const status = formik.status as
    | string
    | { ok: string }
    | undefined;

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="mt-6 space-y-4"
      noValidate
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
          Dirección completa (entrega y envío)
        </span>
        <textarea
          name="address"
          className={`${PULSE.input} min-h-[100px] resize-y`}
          value={formik.values.address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Calle, número, ciudad, código postal..."
          rows={4}
          aria-invalid={Boolean(formik.touched.address && formik.errors.address)}
        />
        {formik.touched.address && formik.errors.address ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.address}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
          Teléfono
        </span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={PULSE.input}
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Ej. 5512345678 o +52 55 1234 5678"
          aria-invalid={Boolean(formik.touched.phone && formik.errors.phone)}
        />
        {formik.touched.phone && formik.errors.phone ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
        ) : null}
      </label>

      {typeof status === "string" ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {status}
        </p>
      ) : null}
      {status && typeof status === "object" && "ok" in status ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {status.ok}
        </p>
      ) : null}

      <button
        type="submit"
        className={`${PULSE.btnPrimary} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={formik.isSubmitting || !formik.isValid}
      >
        {formik.isSubmitting ? "Guardando..." : "Guardar dirección y teléfono"}
      </button>
    </form>
  );
}
