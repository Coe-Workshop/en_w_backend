import { Request, Response } from "express";
import { itemHandler } from "@/pkg/item/handler";
import { ItemService } from "@/pkg/domain/item";
import { ItemCategory } from "@/pkg/models";

describe("Item Handler - getItems", () => {
  let mockItemService: jest.Mocked<ItemService>;
  let handler: ReturnType<typeof itemHandler>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockItemService = {
      getItems: jest.fn(),
      getItemByID: jest.fn(),
      createItem: jest.fn(),
      deleteItemByID: jest.fn(),
      updateItem: jest.fn(),
    };

    handler = itemHandler(mockItemService);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("without filters", () => {
    it("should call getItems with empty filter object", async () => {
      const mockRequest = {
        query: {},
      } as unknown as Request;

      mockItemService.getItems.mockResolvedValue([
        { id: 1, name: "Item 1", categoryName: "MACHINE" as ItemCategory, description: null, imageUrl: null },
        { id: 2, name: "Item 2", categoryName: "ELECTRONIC" as ItemCategory, description: null, imageUrl: null },
      ]);

      await handler.getItems(mockRequest, mockResponse as Response);

      expect(mockItemService.getItems).toHaveBeenCalledWith({
        category: undefined,
        search: undefined,
      });
    });

    it("should return all items with pagination info", async () => {
      const mockRequest = {
        query: {},
      } as unknown as Request;

      const mockItems = [
        { id: 1, name: "Item 1", categoryName: "MACHINE" as ItemCategory, description: null, imageUrl: null },
        { id: 2, name: "Item 2", categoryName: "ELECTRONIC" as ItemCategory, description: null, imageUrl: null },
      ];

      mockItemService.getItems.mockResolvedValue(mockItems);

      await handler.getItems(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          numberOfPage: 1,
          items: mockItems,
        },
      });
    });
  });

  describe("with category filter", () => {
    it("should call getItems with category filter", async () => {
      const mockRequest = {
        query: { category: "MACHINE" },
      } as unknown as Request;

      mockItemService.getItems.mockResolvedValue([
        { id: 1, name: "Machine Item", categoryName: "MACHINE" as ItemCategory, description: null, imageUrl: null },
      ]);

      await handler.getItems(mockRequest, mockResponse as Response);

      expect(mockItemService.getItems).toHaveBeenCalledWith({
        category: "MACHINE",
        search: undefined,
      });
    });

    it("should return filtered items by category", async () => {
      const mockRequest = {
        query: { category: "ELECTRONIC" },
      } as unknown as Request;

      const mockItems = [
        { id: 2, name: "Electronic Item", categoryName: "ELECTRONIC" as ItemCategory, description: null, imageUrl: null },
      ];

      mockItemService.getItems.mockResolvedValue(mockItems);

      await handler.getItems(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          numberOfPage: 1,
          items: mockItems,
        },
      });
    });
  });

  describe("with search filter", () => {
    it("should call getItems with search filter", async () => {
      const mockRequest = {
        query: { search: "drill" },
      } as unknown as Request;

      mockItemService.getItems.mockResolvedValue([
        { id: 1, name: "Drill Machine", categoryName: "MACHINE" as ItemCategory, description: null, imageUrl: null },
      ]);

      await handler.getItems(mockRequest, mockResponse as Response);

      expect(mockItemService.getItems).toHaveBeenCalledWith({
        category: undefined,
        search: "drill",
      });
    });

    it("should return items matching search query", async () => {
      const mockRequest = {
        query: { search: "screwdriver" },
      } as unknown as Request;

      const mockItems = [
        { id: 3, name: "Screwdriver Set", categoryName: "HANDTOOL" as ItemCategory, description: null, imageUrl: null },
      ];

      mockItemService.getItems.mockResolvedValue(mockItems);

      await handler.getItems(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          numberOfPage: 1,
          items: mockItems,
        },
      });
    });
  });

  describe("with both category and search filters", () => {
    it("should call getItems with both filters", async () => {
      const mockRequest = {
        query: { category: "ELECTRONIC", search: "arduino" },
      } as unknown as Request;

      mockItemService.getItems.mockResolvedValue([
        { id: 1, name: "Arduino Board", categoryName: "ELECTRONIC" as ItemCategory, description: null, imageUrl: null },
      ]);

      await handler.getItems(mockRequest, mockResponse as Response);

      expect(mockItemService.getItems).toHaveBeenCalledWith({
        category: "ELECTRONIC",
        search: "arduino",
      });
    });

    it("should return items matching both filters", async () => {
      const mockRequest = {
        query: { category: "MACHINE", search: "lathe" },
      } as unknown as Request;

      const mockItems = [
        { id: 5, name: "Lathe Machine", categoryName: "MACHINE" as ItemCategory, description: null, imageUrl: null },
      ];

      mockItemService.getItems.mockResolvedValue(mockItems);

      await handler.getItems(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          numberOfPage: 1,
          items: mockItems,
        },
      });
    });
  });

  describe("error handling", () => {
    it("should return 500 on service error", async () => {
      const mockRequest = {
        query: {},
      } as unknown as Request;

      mockItemService.getItems.mockRejectedValue(new Error("Database error"));

      await handler.getItems(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "ไม่สามารถเข้าถึงข้อมูลอุปกรณ์ทั้งหมดได้ในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
        error: "Database error",
      });
    });
  });
});