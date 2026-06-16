import { describe, it, beforeEach, expect } from "vitest";
import request from "supertest";
import { prisma } from "../src/lib/prisma";
import app from "../src/app";

beforeEach(() => {
  prisma.user.deleteMany();
});

describe("Test the file upload functionality", () => {
  it("should upload file properly", async () => {
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

    const imageBuffer = Buffer.from("Hello There.");

    var res = await request(app)
      .post("/image/upload/")
      .attach("file", imageBuffer, "image.jpg")
      .set("Authorization", `Bearer ${accessToken}`);
    // console.log(res.body);
    expect(res.statusCode).toBe(200);
    // expect(res.body).toMatchObject()
  });
});
