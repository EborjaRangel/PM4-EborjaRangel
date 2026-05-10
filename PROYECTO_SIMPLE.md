# Tu proyecto en simple

Son **dos programas**:

| Programa | Carpeta | Qué es |
|----------|---------|--------|
| **Front** | `front` | La web (Next). Puerto típico **3001**. |
| **API** | `back` | Lo que habla con Postgres. Puerto típico **3000**. |

---

## Solo en tu PC (sin Vercel ni Render)

1. Abre **terminal A** → carpeta `back` → `npm run dev`  
   Espera a que diga que corre en el puerto **3000**.

2. Abre **terminal B** → carpeta `front` → `npm run dev`  
   Entra en la URL que te muestre (ej. `http://localhost:3001`).

El front reenvía `/pulse-api-proxy` al API por defecto en **`http://127.0.0.1:3000`** (como antes).  
No necesitas variables extra en el front para eso.

3. Postgres debe estar encendido en tu máquina.  
   Config en **`back/.env`** (copia de `back/.env.example`).  
   Para base **local**: **no pongas** `DATABASE_URL`; usa solo `DB_HOST`, `DB_USER`, etc.

Si algo falla, casi siempre es: API no arrancó, Postgres apagado, o en `back/.env` quedó pegada una `DATABASE_URL` de la nube.

---

## En internet (deploy)

También son **dos sitios**; cada uno tiene **sus propias variables** (no son las mismas).

### A) API en Render (o Railway)

- Creas el servicio del **back** con el repo.
- Variables **solo ahí**:
  - `DATABASE_URL` (Postgres en la nube, ej. Neon)
  - `JWT_SECRET` (cualquier texto largo inventado)

Copias la URL pública del API, ej. `https://algo.onrender.com`

### B) Front en Vercel

- Conectas el repo, **Root Directory** = `front`
- **Una** variable **solo ahí**:
  - `PULSE_BACKEND_URL` = esa URL del API **sin** `/` al final

---

## No te mates con las variables

- **Local:** archivos `back/.env` y (opcional) `front/.env.local` — **no se suben a Git**.
- **Render:** solo las del panel de Render para el **back**.
- **Vercel:** solo `PULSE_BACKEND_URL` en el panel del **front**.

Yo (la IA) **no puedo** iniciar sesión en tu Vercel ni en Render por ti; solo tú puedes pegar esas variables en la web.
