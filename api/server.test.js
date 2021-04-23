const request = require("supertest");
const db = require("../data/dbConfig");
const server = require("./server");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
});

afterAll(async () => {
  await db.destroy();
});

test("sanity", () => {
  expect(true).toBe(true);
});

describe("server.js", () => {
  describe("[POST] /api/auth/register - creating user", () => {
    it("[1] creates a new user in the database", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "foobar", password: "1234" });
      const foobar = await db("users").where("username", "foobar").first();
      expect(foobar).toMatchObject({ username: "foobar" });
    });
    it("[2] responds with proper status on succcess", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ username: "foobar", password: "1234" });
      expect(res.status).toBe(201);
    });
  });
  describe("[POST] /api/auth/login", () => {
    it("[3] responds with the correct message on valid credentials", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "foobar", password: "1234" });
      const res = await request(server)
        .post("/api/auth/login")
        .send({ username: "foobar", password: "1234" });
      expect(res.body.message).toMatch(/welcome, foobar/i);
    });
    it("[4] responds with the correct message on invalid credentials", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "foobar", password: "1234" });
      const res = await request(server)
        .post("/api/auth/login")
        .send({ username: "foo", password: "1234" });
      expect(res.body.message).toMatch(/invalid credentials/i);
      expect(res.status).toBe(401);
      const res2 = await request(server)
        .post("/api/auth/login")
        .send({ username: "foobar", password: "123456" });
      expect(res2.body.message).toMatch(/invalid credentials/i);
      expect(res2.status).toBe(401);
    });
  });
});
