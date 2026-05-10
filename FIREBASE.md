# Firebase App Hosting — este repo

Firebase ejecuta **solo el Next.js** de la carpeta **`front`**.  
Tu **Express + Postgres** sigue en otro sitio (Render, Railway, Cloud Run, etc.) y lo enlazas con **`PULSE_BACKEND_URL`**.

## Requisitos

- Cuenta Google y proyecto Firebase en plan **[Blaze](https://firebase.google.com/pricing)** (App Hosting lo pide; hay cuota gratuita razonable, revisa límites).
- Repo en **GitHub** (App Hosting despliega desde Git).
- URL **HTTPS** de tu API ya desplegada (ej. `https://xxx.onrender.com`).

## Pasos en la consola Firebase

1. [Firebase Console](https://console.firebase.google.com) → tu proyecto.
2. Menú **Build** → **App Hosting** (o *Hosting & Serverless* → **App Hosting**).
3. **Get started** / **Create backend**.
4. Conecta **GitHub** y el repo **`PM4-EborjaRangel`**.
5. **Root directory del app:** `front`  
   (donde está el `package.json` de Next).
6. Rama en vivo: **`main`** (o la que uses).
7. Crea el backend y espera el primer **rollout** (unos minutos).

## Variables de entorno (imprescindible para productos / login)

En el backend de App Hosting → **Settings** → **Environment**:

| Nombre | Valor |
|--------|--------|
| `PULSE_BACKEND_URL` | `https://TU-API-PUBLICA.com` **sin** `/` al final |

- Debe existir en **build** y **runtime** (en consola suelen estar en ambos por defecto).
- Tras cambiarla, lanza un **nuevo rollout** (commit + push o redeploy desde la consola).

Opcional: mismas claves que en local para Maps, etc.:  
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, etc.

## Archivo `apphosting.yaml`

Está en **`front/apphosting.yaml`**. Puedes subir límites de memoria/CPU o más `env`; lo que pongas en la **consola** **sobrescribe** lo del YAML.

## Tu URL pública

Algo como:  
`https://BACKEND_ID--PROJECT_ID.REGION.hosted.app`  
(la verás en el panel del backend).

## API en Google (opcional)

Si quieres todo en Google Cloud: empaqueta el **`back`** en **Cloud Run** y usa esa URL en `PULSE_BACKEND_URL`. No está automatizado en este repo; Render/Railway es más rápido para el curso.

## No uses Hosting “clásico” solo para este Next

Hosting estático no sirve para este Next con SSR y rewrites como los tienes; usa **App Hosting**.
