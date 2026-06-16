import { describe, it, beforeEach, expect } from "vitest";
import app from "../src/app";
import request from "supertest";
import { prisma } from "../src/lib/prisma";

beforeEach(async () => {
  await prisma.images.deleteMany();
  await prisma.user.deleteMany();
});

describe("Test login and authentication system", () => {
  it("should login properly", async () => {
    const registerPayload = {
      username: "Sanjeevi Rajan Ramajayam",
      email: "sanjeevi@gmail.com",
      password: "testA1234!",
    };

    await request(app).post("/register").send(registerPayload);

    const loginPayload = {
      username: "Sanjeevi Rajan Ramajayam",
      email: "sanjeevi@gmail.com",
      password: "testA1234!",
    };

    var res = await request(app).post("/login").send(loginPayload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();

    const accessToken = res.body.accessToken;
    expect(accessToken).toBeDefined();
  });
});
