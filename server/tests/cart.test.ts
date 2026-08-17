import { describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestApp } from "./test-app.js";

describe("Carrito", () => {
  it("crea un carrito vacio", async () => {
    const { app } = buildTestApp();

    const res = await request(app).post("/api/cart");

    expect(res.status).toBe(201);
    expect(res.body.cart.items).toEqual([]);
    expect(res.body.cart.totalCents).toBe(0);
  });

  it("agrega items y calcula el total", async () => {
    const { app, products } = buildTestApp();

    const { body: created } = await request(app).post("/api/cart");
    const cartId = created.cart.id;

    const res = await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: products.headphones.id, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.cart.items).toHaveLength(1);
    expect(res.body.cart.totalCents).toBe(4000);

    const res2 = await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: products.lamp.id, quantity: 1 });

    expect(res2.body.cart.totalCents).toBe(5500);
  });

  it("actualiza la cantidad de un item", async () => {
    const { app, products } = buildTestApp();
    const { body: created } = await request(app).post("/api/cart");
    const cartId = created.cart.id;
    await request(app).post(`/api/cart/${cartId}/items`).send({ productId: products.headphones.id, quantity: 1 });

    const res = await request(app)
      .patch(`/api/cart/${cartId}/items/${products.headphones.id}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.cart.items[0].quantity).toBe(3);
    expect(res.body.cart.totalCents).toBe(6000);
  });

  it("elimina un item al poner cantidad 0", async () => {
    const { app, products } = buildTestApp();
    const { body: created } = await request(app).post("/api/cart");
    const cartId = created.cart.id;
    await request(app).post(`/api/cart/${cartId}/items`).send({ productId: products.headphones.id, quantity: 1 });

    const res = await request(app)
      .patch(`/api/cart/${cartId}/items/${products.headphones.id}`)
      .send({ quantity: 0 });

    expect(res.body.cart.items).toEqual([]);
  });

  it("elimina un item explicitamente", async () => {
    const { app, products } = buildTestApp();
    const { body: created } = await request(app).post("/api/cart");
    const cartId = created.cart.id;
    await request(app).post(`/api/cart/${cartId}/items`).send({ productId: products.headphones.id, quantity: 1 });

    const res = await request(app).delete(`/api/cart/${cartId}/items/${products.headphones.id}`);

    expect(res.status).toBe(200);
    expect(res.body.cart.items).toEqual([]);
  });

  it("devuelve 404 para un carrito inexistente", async () => {
    const { app } = buildTestApp();

    const res = await request(app).get("/api/cart/no-existe");

    expect(res.status).toBe(404);
  });

  it("rechaza agregar un producto inexistente", async () => {
    const { app } = buildTestApp();
    const { body: created } = await request(app).post("/api/cart");

    const res = await request(app)
      .post(`/api/cart/${created.cart.id}/items`)
      .send({ productId: "no-existe", quantity: 1 });

    expect(res.status).toBe(404);
  });
});
