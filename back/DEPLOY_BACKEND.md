# Desplegar el API (`back`)

Necesitas **PostgreSQL en la nube** (Neon, Supabase o Postgres en Railway/Render) y copiar su **`DATABASE_URL`**.

## Variables obligatorias en el hosting del API

| Variable        | Ejemplo / notas                                      |
|-----------------|------------------------------------------------------|
| `DATABASE_URL`  | `postgresql://usuario:clave@host:5432/nombre`       |
| `JWT_SECRET`    | Una cadena larga aleatoria (no uses `secret`)      |

Opcional: `PORT` lo suele inyectar el propio Render/Railway (no hace falta tocarla).

---

## Opción A — Render (Web Service con Docker)

1. [Render](https://render.com) → **New +** → **Web Service**.
2. Conecta el repo `PM4-EborjaRangel`.
3. Configura:
   - **Root Directory:** `back`
   - **Environment:** **Docker**
   - El **Dockerfile** debe detectarse solo (`back/Dockerfile`).
4. Instancia: **Free** (si aplica).
5. **Environment** → añade `DATABASE_URL` y `JWT_SECRET`.
6. **Create Web Service**. Espera el build (varios minutos la primera vez).
7. Copia la URL pública (`https://xxxx.onrender.com`).
8. En el navegador prueba: `https://xxxx.onrender.com/` (JSON con `pulse-api`) y `https://xxxx.onrender.com/products`.

## Opción B — Render (Node sin Docker)

1. **Web Service** → mismo repo.
2. **Root Directory:** `back`
3. **Runtime:** Node
4. **Build command:** `npm ci --include=dev && npm run build`
5. **Start command:** `npm start`
6. Variables: `DATABASE_URL`, `JWT_SECRET`.
7. **Node version:** 20 (en Environment o `NODE_VERSION=20`).

## Opción C — Railway

1. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Elige el repo → en el servicio: **Settings → Root Directory** = `back`.
3. Si ofrece Dockerfile, puede usar el de `back/Dockerfile`; si no, usa **Build** = `npm ci --include=dev && npm run build`, **Start** = `npm start`.
4. Añade variables `DATABASE_URL` y `JWT_SECRET` (y crea un plugin Postgres si quieres DB ahí).

---

## Después: Vercel (front)

En el proyecto Next → **Environment Variables**:

- **`PULSE_BACKEND_URL`** = la URL del API **sin** barra final (la misma que probaste en el navegador).

Luego **Redeploy** el front.

---

## Si sigue fallando

1. Abre **Logs** del servicio del API en Render/Railway: errores de Postgres o crash al arrancar son lo más frecuente.
2. Confirma que no creaste un **Static Site** por error (tiene que ser **Web Service** / servicio que ejecute Node o Docker).
3. Prueba **`/health`**: debe responder JSON; si `postgres: false`, revisa `DATABASE_URL` y TLS (`DB_SSL` en `.env.example` del back).
