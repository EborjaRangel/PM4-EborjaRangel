# Desplegar el front en Vercel (con API en Railway u otro host)

Este proyecto vive dentro del monorepo en la carpeta **`front`**. Variables de **demo local / ngrok** van en **`front/.env.local`** (no se sube a Git si está ignorado): **no las borres** al desplegar; Vercel **no usa** ese archivo desde tu disco, solo las variables definidas en su panel.

## Orden recomendado

1. Tené el API desplegado con URL HTTPS (p. ej. Railway) y probá **`/health`** en el navegador.
2. Importá este repo en Vercel y configurá Root Directory (**`front`**).
3. Añadí las variables del apartado siguiente y hacé **Deploy**.
4. Seguí usando en tu PC **`npm run dev`** en `front` y **`npm run dev`** en `back` con tu `.env` / `.env.local` habitual; ngrok sigue igual mientras tus variables locales lo indiquen.

## Configuración en Vercel

| Campo | Valor |
|--------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `front` |
| **Build Command** | `npm run build` (por defecto) |
| **Install Command** | `npm install` (por defecto) |
| **Output** | Inferido por Next (no configures “Static export” si no es tu caso). |

## Variables de entorno (Production y, opcionalmente, Preview)

| Variable | Obligatorio | Ejemplo |
|----------|-------------|---------|
| **`PULSE_BACKEND_URL`** o **`PULSE_PROXY_TARGET`** | Sí para producción | `https://tu-api.up.railway.app` (**sin** barra final). Cualquiera de los dos nombres sirve; el build de Next usa el mismo destino para reescribir `/pulse-api-proxy/*`. |

Opcional según uso:

| Variable | Uso |
|----------|-----|
| **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`** | Mapas en `/cart/ubicacion`. Restringí la key en Google Cloud por referrer a `https://*.vercel.app/*` y tu dominio propio. |
| **`NEXT_PUBLIC_API_URL`** | En producción normalmente **vacío**, para que el navegador use el mismo dominio Vercel + `/pulse-api-proxy`. |
| **`NEXT_PUBLIC_USE_LOCAL_API`** | **No** pongas `true` en Vercel (eso fuerza comportamiento tipo desarrollo contra API local salvo que también definas un proxy remoto).

Tras cambiar la URL del API, hacé **Redeploy** del proyecto en Vercel para que los rewrites del build apunten bien.

## Comprobaciones

- **404 o timeout en datos:** revisá logs de Vercel y que **`PULSE_BACKEND_URL`** sea exactamente la base pública del Express (protocolo HTTPS, sin path extra).
- **Local roto después de configurar la nube:** no commiteás `.env.local`; si algo falla suele ser caché o un `.env.local` pisado accidentalmente por copiar variables de prod.
