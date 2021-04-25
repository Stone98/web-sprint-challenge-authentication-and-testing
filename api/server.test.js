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
  describe("[GET] /api/jokes/", () => {
    it("[5] requests without a token are bounced with proper status and message", async () => {
      const res = await request(server).get("/api/jokes");
      expect(res.status).toBe(401);
      expect(res.body).toMatch(/token required/i);
    });
    it("[6] requests with a valid token obtains a list of jokes", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "foobar", password: "1234" });
      let res = await request(server)
        .post("/api/auth/login")
        .send({ username: "foobar", password: "1234" });
      res = await request(server)
        .get("/api/jokes")
        .set("Authorization", res.body.token);
      expect(res.body).toMatchObject([
        {
          id: "0189hNRf2g",
          joke:
            "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later.",
        },
        {
          id: "08EQZ8EQukb",
          joke:
            "Did you hear about the guy whose whole left side was cut off? He's all right now.",
        },
        {
          id: "08xHQCdx5Ed",
          joke:
            "Why didn’t the skeleton cross the road? Because he had no guts.",
        },
      ]);
    });
  });
  describe("[GET] /api/users/", () => {
    it("[7] requests without a token are bounced with proper status and message", async () => {
      const res = await request(server).get("/api/users");
      expect(res.status).toBe(401);
      expect(res.body).toMatch(/token required/i);
    });
    it("[8] requests with a valid token obtains a list of users", async () => {
      await request(server)
        .post("/api/auth/register")
        .send({ username: "foobar", password: "1234" });
      let res = await request(server)
        .post("/api/auth/login")
        .send({ username: "foobar", password: "1234" });
      res = await request(server)
        .get("/api/users")
        .set("Authorization", res.body.token);
      expect(res.body).toMatchObject([
        {
          id: 1,
          username: "foobar",
        },
      ]);
    });
  });
});
