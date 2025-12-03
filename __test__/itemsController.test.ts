import request from "supertest";
import app from "../src/server";

describe("items", () => {
  beforeEach(() => {});

  describe("GET /api/v1/items", () => {
    it("should return empty array", async () => {
      const response = await request(app)
        .get("/api/v1/items")
        .expect("Content-Type", /json/)
        .expect(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("create item", () => {
    it("should create new item", async () => {
      const mockItem = {
        name: "arduino",
        description: "this is magical arduino",
      };
      const createResponse = await request(app)
        .post("/api/v1/item")
        .send(mockItem)
        .expect("Content-Type", /json/)
        .expect(201);
      const itemId = createResponse.body.id;
      const response = await request(app)
        .get(`api/v1/items/${itemId}`)
        .expect("Content-Type", /json/)
        .expect(200);
      // expect(response.body).toMatchObject()
    });
  });
  describe("delete item", () => {});

  afterEach(() => {});
});
