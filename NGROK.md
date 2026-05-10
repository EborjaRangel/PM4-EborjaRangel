# Dos túneles ngrok (API :3000 + Next :3001)

Tu front puede vivir en una URL `*.ngrok-free.app` y el Express en **otra**. El navegador no puede usar `localhost:3000` desde fuera de tu PC; por eso el cliente llama al API por la URL pública del túnel del API.

Este repo ya lo soporta con **`NEXT_PUBLIC_API_URL`** (ver `front/lib/resolveApiOrigin.ts`): si está definido, el navegador habla **directo** con ese origen (CORS en tu `back` ya está abierto con `cors()`).

## Requisitos

- [ngrok](https://ngrok.com/) instalado y cuenta (una vez: `ngrok config add-authtoken TU_TOKEN`).
- **Terminal 1:** carpeta `back` → `npm run dev` (puerto **3000**).
- **Terminal 2:** carpeta `front` → `npm run dev` (puerto **3001**).

## Opción A — Un solo comando (recomendado)

1. Copia el ejemplo de configuración:
   ```bash
   copy ngrok.yml.example ngrok.yml
   ```
   En macOS/Linux: `cp ngrok.yml.example ngrok.yml`

2. (Opcional) Si tu token **no** está en la config global de ngrok, edita `ngrok.yml` y descomenta / pon `authtoken:` según la [documentación de ngrok](https://ngrok.com/docs/agent/config/).

3. Desde la **raíz del repo** (donde está `ngrok.yml`):

   ```bash
   ngrok start --config ngrok.yml pulse-api pulse-web
   ```

   Si tu CLI solo acepta un túnel a la vez, usa la **opción B** de abajo.

4. En la consola o en `http://127.0.0.1:4040` verás **dos URLs públicas**. Identifica cuál es **3000** (API) y cuál **3001** (web).

5. Crea o edita **`front/.env.local`**:
   ```env
   NEXT_PUBLIC_API_URL=https://TU-SUBDOMINIO-API.ngrok-free.app
   ```
   - Sin barra `/` al final.  
   - **Solo** la URL del túnel del **API**, no la del front.

6. **Reinicia** `npm run dev` del front para cargar `.env.local`.

7. Abre en el navegador la URL https del túnel del **front** (puerto 3001).

## Opción B — Dos terminales ngrok

Si el comando con **dos túneles** no funciona o tu plan solo permite un proceso ngrok:

- Terminal A: `ngrok http 3000` → copia la URL → `NEXT_PUBLIC_API_URL` en `front/.env.local`.
- Terminal B: `ngrok http 3001` → abre esta URL en el navegador.

## Sin ngrok (solo tú en la misma PC)

Borra o vacía `NEXT_PUBLIC_API_URL` en `front/.env.local` y reinicia el front; volverá a usar `/pulse-api-proxy` → `localhost:3000`.

## Notas

- Las URLs gratis de ngrok **cambian** al reiniciar (salvo dominio reservado de pago): tendrás que **actualizar** `NEXT_PUBLIC_API_URL` y reiniciar Next.
- Pantalla de bienvenida **ngrok**: en planes free a veces aparece; hay que pulsar **Visit Site**.
- **Postgres** sigue en `localhost:5432` en tu `back/.env`; ngrok **no** sustituye la base de datos.
