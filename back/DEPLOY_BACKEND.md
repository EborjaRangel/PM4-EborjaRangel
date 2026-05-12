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

## Opción C — Railway (recomendado con este repo)

### C1 — API con Dockerfile (preferido)

El directorio **`back/`** incluye un `Dockerfile` que ya hace `npm ci --include=dev`, compila TypeScript y deja sólo artefactos de producción en la imagen final.

1. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Elegí el mismo monorepo.
3. En el servicio del API → **Settings → Root Directory** = **`back`**.
4. Railway debería detectar **Dockerfile** como builder. Si podés elegir, usá esa opción frente a Nixpacks “Node” si el build fallara por falta de `typescript` en instalación sólo-production.
5. **Variables:**
   - **`DATABASE_URL`**: desde un plugin **Postgres** (Railway suele enlazarla al servicio) o cadena Neon/Supabase.
   - **`JWT_SECRET`**: cadena larga aleatoria (no uses `secret`).
6. **Generate Domain** para obtener algo como `https://xxx.up.railway.app`.
7. Probá en el navegador: **`/`** (JSON `pulse-api`), **`/health`**, **`/products`**.

Railway inyecta **`PORT`** automáticamente; el código ya usa **`process.env.PORT`** con fallback **`3000`**. **`HOST`** por defecto es **`0.0.0.0`** en `src/config/envs.ts` (correcto para contenedor/nube).

### C2 — API sin Docker (Node / Nixpacks)

Si no usás Docker:

- **Install / Build:** configurá comando de instalación que **incluya devDependencies**, o el build puede fallar al no encontrar **`tsc`**. Ejemplo: **`npm ci --include=dev && npm run build`** (véase **`package-lock.json`** en `back`).
- **Start:** **`npm start`**

### Postgres en Railway

- **New → Database → PostgreSQL** y enlazá el servicio al API; Railway rellena **`DATABASE_URL`**.
- Migraciones/esquema: según cómo inicialice TypeORM vuestro proyecto (primer arranque con entidades síncronas o migraciones ya aplicadas manualmente).

### Localhost y demos con ngrok

Desplegar en Railway **no cambia** los archivos **`back/.env`** ni **`front/.env.local`** en tu PC: seguí usando **API en `:3000`** y Next en `:3001` como siempre mientras tus variables locales sigan igual. Las URLs de Railway son **sólo** para Vercel (variable **`PULSE_BACKEND_URL`** / **`PULSE_PROXY_TARGET`**) u otras demos remotas sin túnel.

---

## Después: Vercel (front)

Guía detallada: **`front/DEPLOY_VERCEL.md`**.

Resumen → en el proyecto Next (Vercel) → **Settings → Environment Variables**:

- **`PULSE_BACKEND_URL`** **o** **`PULSE_PROXY_TARGET`** = URL del API **sin** barra final (la que probaste en el navegador).

Luego **Redeploy** el front.

---

## Si sigue fallando

1. Abre **Logs** del servicio del API en Render/Railway: errores de Postgres o crash al arrancar son lo más frecuente.
2. Confirma que no creaste un **Static Site** por error (tiene que ser **Web Service** / servicio que ejecute Node o Docker).
3. Prueba **`/health`**: debe responder JSON; si `postgres: false`, revisa `DATABASE_URL` y TLS (`DB_SSL` en `.env.example` del back).

---

## Copia de tu Postgres local → archivo para importar en Railway

Objetivo: un **único archivo `.sql`** (texto) que podés restaurar en Railway con `psql`.

### Requisito en tu PC

Herramientas de cliente **PostgreSQL** (`pg_dump`, `psql`). En Windows: instalá [PostgreSQL](https://www.postgresql.org/download/windows/) o solo las *command line tools*; añadí la carpeta `bin` al `PATH` o usá la ruta completa a `pg_dump.exe`.

### 1. Exportar (dump) a archivo

Ajustá **host**, **puerto**, **usuario**, **nombre de la base** y **contraseña** según tu `back/.env` (por defecto en el ejemplo del repo: base `proyecto_m4_front`, usuario `postgres`).

**PowerShell (Windows):**

```powershell
$env:PGPASSWORD = "TU_PASSWORD_LOCAL"
pg_dump -h localhost -p 5432 -U postgres -d proyecto_m4_front --no-owner --no-acl -F p -f "$env:USERPROFILE\Desktop\pulse_railway_export.sql"
```

- **`--no-owner --no-acl`**: evitan errores de dueños/permisos distintos en Railway.  
- **`-F p`**: formato **texto plano** (`.sql`), ideal para importar con `psql`.  
- Guardá el archivo donde quieras; **no lo subas a Git** (contiene datos).

### 2. Importar en Railway

1. En Railway → servicio **Postgres** → copiá **`DATABASE_URL`** (la cadena `postgresql://...`).  
2. En tu PC:

```powershell
psql "PEGAR_AQUI_DATABASE_URL_DE_RAILWAY" -f "$env:USERPROFILE\Desktop\pulse_railway_export.sql"
```

Si la base en Railway ya tenía esquemas viejos y querés empezar limpio, conectá con `psql` a esa URL y ejecutá antes:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Luego volvé a ejecutar el `psql ... -f pulse_railway_export.sql`.

### 3. Enlazar el API

En el servicio del **backend** en Railway, variable **`DATABASE_URL`** = la misma URL del Postgres de Railway (y **`JWT_SECRET`** fuerte).

### Alternativa: formato binario

`pg_dump -F c -f backup.dump` y en destino `pg_restore -d "DATABASE_URL" backup.dump` (misma idea; el `.sql` suele ser más simple para depurar).
