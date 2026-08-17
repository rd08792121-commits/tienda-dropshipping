import { describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestApp } from "./test-app.js";

describe("GET /api/products", () => {
  it("lista los productos sembrados", async () => {
    const { app, products } = buildTestApp();

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    expect(res.body.products.map((p: { id: string }) => p.id)).toEqual(
      expect.arrayContaining([products.headphones.id, products.lamp.id]),
    );
  });

  it("devuelve 404 para un producto inexistente", async () => {
    const { app } = buildTestApp();

    const res = await request(app).get("/api/products/no-existe");

    expect(res.status).toBe(404);
  });

  it("devuelve un producto por id", async () => {
    const { app, products } = buildTestApp();

    const res = await request(app).get(`/api/products/${products.headphones.id}`);

    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe("Auriculares Test");
  });
});
