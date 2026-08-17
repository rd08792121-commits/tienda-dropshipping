# Backend Stripe (Node.js/Express)

Backend independiente en Node.js + Express + TypeScript con catalogo de productos, carrito y pagos
via Stripe Checkout. Vive en `server/` como proyecto aparte, con su propio `package.json`; no
depende del storefront Next.js del resto del repo ni lo modifica.

## Stack

- Express 4 + TypeScript (ESM, `NodeNext`)
- SQLite (`better-sqlite3`) para productos, carritos y pedidos
- Stripe Checkout Sessions + webhooks firmados
- Validacion de entrada con `zod`
- Tests con `vitest` + `supertest` (Stripe mockeado, sin llamadas reales)

## Puesta en marcha

```bash
cd server
npm install
cp .env.example .env   # completa STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET
npm run seed            # inserta 4 productos de ejemplo en SQLite
npm run dev              # http://localhost:4000
```

Para probar webhooks en local, usa el Stripe CLI:

```bash
stripe listen --forward-to localhost:4000/api/webhook/stripe
```

Copia el `whsec_...` que imprime a `STRIPE_WEBHOOK_SECRET` en `.env`.

## Scripts

| Script | Descripcion |
|---|---|
| `npm run dev` | Servidor con recarga (`tsx watch`) |
| `npm run build` | Compila a `dist/` (incluye `schema.sql`) |
| `npm start` | Corre el build compilado |
| `npm run seed` | Siembra productos de ejemplo |
| `npm test` | Corre los tests (vitest) |
| `npm run typecheck` | `tsc --noEmit` |

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/health` | Healthcheck |
| GET | `/api/products` | Lista productos |
| GET | `/api/products/:id` | Detalle de producto |
| POST | `/api/cart` | Crea un carrito |
| GET | `/api/cart/:cartId` | Carrito con items y total |
| POST | `/api/cart/:cartId/items` | Agrega item `{ productId, quantity }` |
| PATCH | `/api/cart/:cartId/items/:productId` | Cambia cantidad `{ quantity }` (0 elimina) |
| DELETE | `/api/cart/:cartId/items/:productId` | Elimina item |
| POST | `/api/checkout/session` | Crea sesion de Stripe Checkout `{ cartId, customerEmail? }` |
| POST | `/api/webhook/stripe` | Webhook de Stripe (firma verificada) |
| GET | `/api/orders/:id` | Detalle de pedido |
| GET | `/api/orders/by-session/:sessionId` | Pedido por `session_id` de Stripe |

## Flujo de pago

1. `POST /api/cart` y `POST /api/cart/:cartId/items` arman el carrito.
2. `POST /api/checkout/session` crea la sesion en Stripe con los items del carrito y una orden
   `pending` en SQLite referenciando el `stripe_session_id`.
3. El cliente redirige a la `url` devuelta (Stripe Checkout hospedado).
4. Stripe llama a `POST /api/webhook/stripe` con `checkout.session.completed`; el pedido pasa a
   `paid`, se guarda el `payment_intent` y se descuenta stock. `checkout.session.expired` marca el
   pedido como `canceled`.
5. El frontend consulta `GET /api/orders/:id` (o `by-session/:sessionId` en la pagina de
   confirmacion) para mostrar el estado final.

## Variables de entorno

Ver `.env.example`. `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` son opcionales para arrancar el
servidor (productos y carrito funcionan sin ellas), pero son obligatorias para `/api/checkout/session`
y `/api/webhook/stripe`.
