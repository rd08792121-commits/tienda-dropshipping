import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { buildTestApp } from "./test-app.js";

const fakeStripe = {
  checkout: { sessions: { create: vi.fn() } },
  webhooks: { constructEvent: vi.fn() },
};

vi.mock("../src/lib/stripe.js", () => ({
  getStripeClient: () => fakeStripe,
}));

beforeEach(() => {
  fakeStripe.checkout.sessions.create.mockReset();
  fakeStripe.webhooks.constructEvent.mockReset();
});

describe("POST /api/checkout/session", () => {
  it("crea una sesion de Stripe y una orden pendiente", async () => {
    fakeStripe.checkout.sessions.create.mockResolvedValueOnce({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/test",
    });

    const { app, products } = buildTestApp();
    const { body: created } = await request(app).post("/api/cart");
    await request(app).post(`/api/cart/${created.cart.id}/items`).send({ productId: products.headphones.id, quantity: 2 });

    const res = await request(app).post("/api/checkout/session").send({ cartId: created.cart.id });

    expect(res.status).toBe(201);
    expect(res.body.url).toBe("https://checkout.stripe.com/test");
    expect(res.body.sessionId).toBe("cs_test_123");
    expect(fakeStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        line_items: [
          expect.objectContaining({
            quantity: 2,
            price_data: expect.objectContaining({ unit_amount: 2000 }),
          }),
        ],
      }),
    );

    const orderRes = await request(app).get(`/api/orders/${res.body.orderId}`);
    expect(orderRes.body.order.status).toBe("pending");
    expect(orderRes.body.order.totalCents).toBe(4000);
  });

  it("rechaza el checkout con un carrito vacio", async () => {
    const { app } = buildTestApp();
    const { body: created } = await request(app).post("/api/cart");

    const res = await request(app).post("/api/checkout/session").send({ cartId: created.cart.id });

    expect(res.status).toBe(400);
    expect(fakeStripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("devuelve 404 si el carrito no existe", async () => {
    const { app } = buildTestApp();

    const res = await request(app).post("/api/checkout/session").send({ cartId: "no-existe" });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/webhook/stripe", () => {
  it("marca el pedido como pagado y descuenta stock al recibir checkout.session.completed", async () => {
    fakeStripe.checkout.sessions.create.mockResolvedValueOnce({
      id: "cs_test_456",
      url: "https://checkout.stripe.com/456",
    });

    const { app, products } = buildTestApp();
    const { body: created } = await request(app).post("/api/cart");
    await request(app).post(`/api/cart/${created.cart.id}/items`).send({ productId: products.headphones.id, quantity: 2 });
    const checkoutRes = await request(app).post("/api/checkout/session").send({ cartId: created.cart.id });

    fakeStripe.webhooks.constructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_456", payment_intent: "pi_123" } },
    });

    const webhookRes = await request(app)
      .post("/api/webhook/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "test-signature")
      .send(JSON.stringify({ irrelevant: true }));

    expect(webhookRes.status).toBe(200);
    expect(webhookRes.body).toEqual({ received: true });

    const orderRes = await request(app).get(`/api/orders/${checkoutRes.body.orderId}`);
    expect(orderRes.body.order.status).toBe("paid");
    expect(orderRes.body.order.stripePaymentIntentId).toBe("pi_123");

    const productRes = await request(app).get(`/api/products/${products.headphones.id}`);
    expect(productRes.body.product.stock).toBe(8);
  });

  it("rechaza el webhook sin cabecera stripe-signature", async () => {
    const { app } = buildTestApp();

    const res = await request(app)
      .post("/api/webhook/stripe")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ irrelevant: true }));

    expect(res.status).toBe(400);
  });
});
