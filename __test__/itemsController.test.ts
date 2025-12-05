import request from "supertest";
import app from "../src/server";

describe("items", () => {
  beforeEach(() => {});

  describe("POST /api/v1/item", () => {
    it("should really create new item", async () => {
      const mockItem = {
        name: "arduino",
        description: "this is magical arduino",
      };
      const response = await request(app)
        .post("/api/v1/items")
        .send(mockItem)
        .expect("Content-Type", /json/)
        .expect(201);
      expect(response.body.name).toBe(mockItem.name);
      expect(response.body).toHaveProperty("id");
      expect(response.body.id).toBeDefined();
    });

    it("should error if don't send name", async () => {
      const mockItem = {};
      const response = await request(app)
        .post("/api/v1/items")
        .send(mockItem)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body.error).toMatch(/name.*required/i);
    });

    it("should error if name is empty string", async () => {
      const mockItem = {
        name: "     ",
      };
      const response = await request(app)
        .post("/api/v1/items")
        .send(mockItem)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body.error).toMatch(/name.*empty/i);
    });

    it("should trim whitespace", async () => {
      const mockItem = {
        name: "   ESP32   ",
        description: "   Microcontroller   ",
      };

      const response = await request(app)
        .post("/api/v1/items")
        .send(mockItem)
        .expect(201);

      expect(response.body.name).toBe("ESP32");
      expect(response.body.description).toBe("Microcontroller");
    });
  });

  describe("delete item", () => {});

  afterEach(() => {});
});
