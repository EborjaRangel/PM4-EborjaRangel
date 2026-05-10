# Desplegar en Seenode (PostgreSQL + API + Next)

[Seenode](https://seenode.com/) permite **Web Services** (Node) y **PostgreSQL gestionado**. Es muy parecido conceptualmente a tener Postgres + Node en tu laptop, pero en la nube.

Documentación útil de Seenode:

- [Primer deploy](https://seenode.com/docs/getting-started/your-first-deploy)
- [Express](https://seenode.com/docs/frameworks/javascript/express)
- [Monorepo → Root Directory](https://seenode.com/docs/guides/deployments/root-directory-configuration)
- [Puerto del contenedor](https://seenode.com/docs/guides/deployments/port-configuration)
- [Bases de datos](https://seenode.com/docs/services/databases)

---

## Importante sobre el puerto

Seenode **no inyecta** la variable `PORT`. Tú eliges el puerto en el **campo Port** del servicio y tu app debe escuchar en **`0.0.0.0`** con **ese mismo número**.

- **API (`back`)**: en código usa **3000** si no hay `PORT` → en Seenode pon **Port = 3000**.
- **Front (`front`)**: `npm start` usa `next start -p 3001` → en Seenode pon **Port = 3001**.

Tu API ya escucha en **`0.0.0.0`** por defecto (`back/src/config/envs.ts`).

---

## Paso 1 — PostgreSQL en Seenode

1. Entra en [cloud.seenode.com](https://cloud.seenode.com/).
2. Crea una base **PostgreSQL** en la misma región que vayas a usar para los Web Services.
3. Copia la **cadena de conexión** (connection string / `DATABASE_URL`) que te muestre el panel.

Es compatible con TypeORM igual que en tu laptop.

---

## Paso 2 — Web Service del API (`back`)

1. **New** → **Web Service** → conecta el repo **PM4-EborjaRangel**.
2. **Root Directory:** `back`
3. **Port:** `3000`
4. **Build command:**

   ```bash
   npm ci --include=dev && npm run build
   ```

5. **Start command:**

   ```bash
   npm start
   ```

6. **Environment variables** (nombres como en tu proyecto):

   | Variable        | Valor |
   |-----------------|--------|
   | `DATABASE_URL` | La que te dio Seenode al crear Postgres (pegar completa). |
   | `JWT_SECRET`    | Texto largo aleatorio (no uses el valor por defecto del código). |

7. Crea el servicio y espera a que esté **Live**. Copia la URL pública HTTPS (ej. `https://….apps.run-on-seenode.com`).

8. Prueba en el navegador: `https://TU-API/` (JSON `pulse-api`) y `https://TU-API/products`.

---

## Paso 3 — Web Service del front (`front`)

1. **New** → **Web Service** → mismo repo.
2. **Root Directory:** `front`
3. **Port:** `3001` (coincide con `npm start` del `package.json`).
4. **Build command:**

   ```bash
   npm ci --include=dev && npm run build
   ```

   (Así TypeScript y herramientas de build del `package-lock` no se saltan si el entorno marca producción.)

5. **Start command:**

   ```bash
   npm start
   ```

6. **Environment variables:**

   | Variable             | Valor |
   |----------------------|--------|
   | `PULSE_BACKEND_URL`  | URL **HTTPS** del API del paso 2, **sin** `/` final. |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Si usas mapas en `/cart/ubicacion`, la misma que en local. |

   `PULSE_BACKEND_URL` debe existir en **build** y **runtime** (los `rewrites` de `next.config.ts` se resuelven en el build; si cambias la URL del API, vuelve a desplegar el front).

7. Despliega y abre la URL pública del front.

---

## Orden recomendado

1. Postgres → 2. API (`back`) → comprobar `/` y `/products` → 3. Front (`front`) con `PULSE_BACKEND_URL`.

---

## Fallos típicos

- **502 / no responde**: el **Port** del servicio no coincide con el puerto al que escucha la app (3000 API, 3001 front).
- **Error de base**: `DATABASE_URL` mal pegada o base en otra región (crea DB y servicios en la misma región si el panel lo permite).
- **Tienda vacía / 404 en API**: `PULSE_BACKEND_URL` mal escrita o falta redeploy del **front** tras crear el API.

Si quieres **solo** API + Postgres en Seenode y el front en Vercel, despliega solo el paso 1–2 y en Vercel pon la misma URL del API en `PULSE_BACKEND_URL`.
