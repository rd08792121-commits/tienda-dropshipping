import type { Database } from "better-sqlite3";
import { Router } from "express";
import { z } from "zod";
import { getCartWithItems } from "../db/carts.js";
import { createOrder } from "../db/orders.js";
import { env } from "../env.js";
import { asyncHandler } from "../lib/async-handler.js";
import { AppError, NotFoundError } from "../lib/errors.js";
import { getStripeClient } from "../lib/stripe.js";

const createSessionSchema = z.object({
  cartId: z.string().min(1),
  customerEmail: z.string().email().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export function createCheckoutRouter(db: Database) {
  const router = Router();

  router.post(
    "/session",
    asyncHandler(async (req, res) => {
      const { cartId, customerEmail, successUrl, cancelUrl } = createSessionSchema.parse(req.body);

      const cart = getCartWithItems(db, cartId);
      if (!cart) {
        throw new NotFoundError(`Carrito ${cartId} no encontrado`);
      }
      if (cart.items.length === 0) {
        throw new AppError("El carrito esta vacio", 400);
      }

      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: cart.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: item.product.currency,
            unit_amount: item.product.priceCents,
            product_data: {
              name: item.product.name,
              images: item.product.imageUrl ? [item.product.imageUrl] : undefined,
            },
          },
        })),
        success_url: successUrl ?? env.CHECKOUT_SUCCESS_URL,
        cancel_url: cancelUrl ?? env.CHECKOUT_CANCEL_URL,
        customer_email: customerEmail,
        metadata: { cartId },
      });

      if (!session.url) {
        throw new AppError("Stripe no devolvio una URL de checkout", 502);
      }

      const order = createOrder(db, {
        cartId,
        stripeSessionId: session.id,
        totalCents: cart.totalCents,
        currency: cart.currency,
        customerEmail,
        items: cart.items,
      });

      res.status(201).json({ url: session.url, sessionId: session.id, orderId: order.id });
    }),
  );

  return router;
}
