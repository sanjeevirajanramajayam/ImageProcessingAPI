import { it, describe, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";

beforeEach(async () => {
  await prisma.images.deleteMany()
  await prisma.user.deleteMany();
});

describe("Test the register functinality", () => {
  it("should register a new user", async () => {
    // ARRANGE, ACT, ASSERT

    // ARRANGE
    const endpoint = "/register";

    const userPayload = {
      username: "Sanjeevi Rajan Ramajayam",
      email: "sanjeevi@gmail.com",
      password: "testA1234!",
    };

    // ACT
    const res = await request(app).post(endpoint).send(userPayload);

    // ASSERT
    expect(res.status).toBe(201);
    // This doesn't have match the object exactly.
    // We can skip id and certain fields.
    // The specified fields must match.
    expect(res.body).toMatchObject({
      name: "Sanjeevi Rajan Ramajayam",
      email: "sanjeevi@gmail.com",
      message: "Registration successful",
    });
  });

  it("should fail on duplicate user emails", async () => {
    // ARRANGE, ACT, ASSERT

    // ARRANGE
    const endpoint = "/register";

    const userPayload = {
      username: "Sanjeevi Rajan Ramajayam",
      email: "sanjeevi@gmail.com",
      password: "testA1234!",
    };

    // ACT
    await request(app).post(endpoint).send(userPayload);
    const res = await request(app).post(endpoint).send(userPayload);

    // ASSERT
    expect(res.status).toBe(409);
    // This doesn't have match the object exactly.
    // We can skip id and certain fields.
    // The specified fields must match.
    expect(res.body).toMatchObject({
      message: "Email already registered",
    });
  });
});
