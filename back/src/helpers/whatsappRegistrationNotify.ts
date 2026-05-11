/**
 * Aviso por WhatsApp al registrarse: se envía al **teléfono que el usuario capturó** (sin contraseña).
 * Usa CallMeBot: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 *
 * Requiere `WHATSAPP_CALLMEBOT_APIKEY` en `.env`. El destinatario debe haber activado el bot
 * de CallMeBot en ese mismo número de WhatsApp (ver guía del sitio).
 */

function mexicoDateTime(d: Date): string {
  return d.toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Solo dígitos; si son 10, se asume México y se antepone 52. */
export function normalizePhoneForWhatsAppApi(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length < 10) return null;
  if (d.length === 10) return `52${d}`;
  return d;
}

export type NewRegistrationWhatsAppPayload = {
  email: string;
  name: string;
  phone: string;
  registeredAt: Date;
};

export async function notifyNewRegistrationWhatsApp(
  payload: NewRegistrationWhatsAppPayload
): Promise<void> {
  const apiKey = process.env.WHATSAPP_CALLMEBOT_APIKEY?.trim();
  if (!apiKey) return;

  const destPhone = normalizePhoneForWhatsAppApi(payload.phone);
  if (!destPhone) {
    console.warn(
      "[whatsappRegistrationNotify] Teléfono inválido o muy corto; no se envía WhatsApp."
    );
    return;
  }

  const text = [
    "✅ *PULSE — Registro completado*",
    "",
    `Tu cuenta ya quedó registrada el *${mexicoDateTime(payload.registeredAt)}*.`,
    "",
    `📧 Correo: ${payload.email}`,
    `👤 Nombre: ${payload.name}`,
    "",
    "Ya puedes iniciar sesión en la tienda.",
  ].join("\n");

  const url =
    "https://api.callmebot.com/whatsapp.php?" +
    new URLSearchParams({
      phone: destPhone,
      text,
      apikey: apiKey,
    }).toString();

  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(
        "[whatsappRegistrationNotify] CallMeBot respondió",
        res.status,
        body.slice(0, 200)
      );
    }
  } catch (err) {
    console.warn("[whatsappRegistrationNotify] error de red:", err);
  }
}
