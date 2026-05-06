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
    "Indica una direccion mas completa: calle, numero, ciudad o codigo postal.",
  )
  .max(240, "La direccion supera el maximo permitido.")
  .matches(
    /[A-Za-zÁÉÍÓÚáéíóúÑñÜü]/,
    "Debe incluir el nombre de calle, colonia o ciudad.",
  )
  .matches(
    /\d/,
    "Incluye al menos un numero (numero exterior/interior o codigo postal).",
  )
  .required("La direccion es obligatoria.");

export const deliveryPhoneYup = Yup.string()
  .trim()
  .required("El telefono es obligatorio.")
  .test(
    "phone-digits",
    "El telefono debe tener entre 9 y 15 digitos.",
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
