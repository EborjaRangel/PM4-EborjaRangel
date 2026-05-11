import * as Yup from "yup";
import type { IContactDeliveryFormValues } from "@/interfaces/auth.interface";

/** Solo dígitos para persistir (acepta entrada con espacios o guiones). */
export function normalizePhoneDigits(input: string): string {
  return input.trim().replace(/\D/g, "");
}

export const deliveryAddressYup = Yup.string()
  .trim()
  .min(
    12,
    "Indica una dirección más completa: calle, número, ciudad o código postal.",
  )
  .max(240, "La dirección supera el máximo permitido.")
  .matches(
    /[A-Za-zÁÉÍÓÚáéíóúÑñÜü]/,
    "Debe incluir el nombre de calle, colonia o ciudad.",
  )
  .matches(
    /\d/,
    "Incluye al menos un número (número exterior/interior o código postal).",
  )
  .required("La dirección es obligatoria.");

export const deliveryPhoneYup = Yup.string()
  .trim()
  .required("El teléfono es obligatorio.")
  .test(
    "phone-digits",
    "El teléfono debe tener entre 9 y 15 dígitos.",
    (val) => {
      const d = normalizePhoneDigits(val ?? "");
      return d.length >= 9 && d.length <= 15;
    },
  );

export const deliveryContactValidationSchema: Yup.ObjectSchema<IContactDeliveryFormValues> =
  Yup.object({
    address: deliveryAddressYup,
    phone: deliveryPhoneYup,
  });
