import { Request, Response } from "express";
import { itemHandler } from "@/pkg/item/handler";
import { ItemService } from "@/pkg/domain/item";
import { ItemCategory } from "@/pkg/models";

// Mock S3 service - need to mock before importing the module
jest.mock("@/pkg/upload/s3.service", () => ({
  s3Service: {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileUrl: jest.fn(),
    getPublicUrl: jest.fn(),
    isValidImageType: jest.fn(),
    isValidFileSize: jest.fn(),
  },
}));

// Import after mocking
import { s3Service } from "@/pkg/upload/s3.service";

describe("Item Handler - Image Upload Integration", () => {
  let mockItemService: jest.Mocked<ItemService>;
  let handler: ReturnType<typeof itemHandler>;
  let mockResponse: Partial<Response>;
  let mockS3Service: jest.Mocked<typeof s3Service>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockS3Service = s3Service as jest.Mocked<typeof s3Service>;
    
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

  describe("createItem with image", () => {
    it("should create item with uploaded image", async () => {
      const mockFile = {
        buffer: Buffer.from("test-image-data"),
        mimetype: "image/png",
        size: 1024,
        originalname: "test-image.png",
      };

      const mockRequest = {
        body: {
          name: "Arduino Uno",
          description: "Microcontroller board",
          categoryName: "ELECTRONIC",
        },
        file: mockFile,
      } as unknown as Request;

      mockS3Service.isValidImageType.mockReturnValue(true);
      mockS3Service.isValidFileSize.mockReturnValue(true);
      mockS3Service.uploadFile.mockResolvedValue("uploads/1234567890-abc123.png");
      mockS3Service.getPublicUrl.mockReturnValue("https://bucket.s3.region.amazonaws.com/uploads/1234567890-abc123.png");
      mockItemService.createItem.mockResolvedValue({
        id: 1,
        name: "Arduino Uno",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC" as ItemCategory,
        categoryID: 1,
        imageUrl: "https://bucket.s3.region.amazonaws.com/uploads/1234567890-abc123.png",
        assetIDs: null,
      });

      await handler.createItem(mockRequest, mockResponse as Response);

      expect(mockS3Service.isValidImageType).toHaveBeenCalledWith("image/png");
      expect(mockS3Service.isValidFileSize).toHaveBeenCalledWith(1024);
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.mimetype,
        mockFile.originalname
      );
      expect(mockItemService.createItem).toHaveBeenCalledWith({
        name: "Arduino Uno",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC",
        imageUrl: "https://bucket.s3.region.amazonaws.com/uploads/1234567890-abc123.png",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("should create item without image", async () => {
      const mockRequest = {
        body: {
          name: "Arduino Uno",
          description: "Microcontroller board",
          categoryName: "ELECTRONIC",
        },
        file: undefined,
      } as unknown as Request;

      mockItemService.createItem.mockResolvedValue({
        id: 1,
        name: "Arduino Uno",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC" as ItemCategory,
        categoryID: 1,
        imageUrl: null,
        assetIDs: null,
      });

      await handler.createItem(mockRequest, mockResponse as Response);

      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
      expect(mockItemService.createItem).toHaveBeenCalledWith({
        name: "Arduino Uno",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC",
        imageUrl: undefined,
      });
    });

    it("should return 500 if image upload fails", async () => {
      const mockFile = {
        buffer: Buffer.from("test-image-data"),
        mimetype: "image/png",
        size: 1024,
        originalname: "test-image.png",
      };

      const mockRequest = {
        body: {
          name: "Arduino Uno",
          description: "Microcontroller board",
          categoryName: "ELECTRONIC",
        },
        file: mockFile,
      } as unknown as Request;

      mockS3Service.isValidImageType.mockReturnValue(true);
      mockS3Service.isValidFileSize.mockReturnValue(true);
      mockS3Service.uploadFile.mockRejectedValue(new Error("S3 upload failed"));

      await handler.createItem(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining("สร้าง"),
        error: "S3 upload failed",
      });
    });

    it("should validate image type", async () => {
      const mockFile = {
        buffer: Buffer.from("test-data"),
        mimetype: "application/pdf",
        size: 1024,
        originalname: "test.pdf",
      };

      const mockRequest = {
        body: {
          name: "Arduino Uno",
          description: "Microcontroller board",
          categoryName: "ELECTRONIC",
        },
        file: mockFile,
      } as unknown as Request;

      mockS3Service.isValidImageType.mockReturnValue(false);

      await handler.createItem(mockRequest, mockResponse as Response);

      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid file type. Only images are allowed (png, jpg, jpeg, gif, webp)",
      });
    });

    it("should validate image size", async () => {
      const mockFile = {
        buffer: Buffer.from("test-data"),
        mimetype: "image/png",
        size: 10 * 1024 * 1024, // 10MB
        originalname: "large-image.png",
      };

      const mockRequest = {
        body: {
          name: "Arduino Uno",
          description: "Microcontroller board",
          categoryName: "ELECTRONIC",
        },
        file: mockFile,
      } as unknown as Request;

      mockS3Service.isValidImageType.mockReturnValue(true);
      mockS3Service.isValidFileSize.mockReturnValue(false);

      await handler.createItem(mockRequest, mockResponse as Response);

      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "File size exceeds maximum limit of 5MB",
      });
    });
  });

  describe("deleteItemByID with image", () => {
    it("should delete item and its image", async () => {
      const mockRequest = {
        params: { id: "1" },
      } as unknown as Request;

      mockItemService.getItemByID.mockResolvedValue({
        id: 1,
        name: "Arduino Uno",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC" as ItemCategory,
        categoryID: 1,
        imageUrl: "https://bucket.s3.region.amazonaws.com/uploads/1234567890-abc123.png",
        assetIDs: null,
      });
      mockS3Service.deleteFile.mockResolvedValue(undefined);
      mockItemService.deleteItemByID.mockResolvedValue(undefined);

      await handler.deleteItemByID(mockRequest, mockResponse as Response);

      expect(mockS3Service.deleteFile).toHaveBeenCalledWith("uploads/1234567890-abc123.png");
      expect(mockItemService.deleteItemByID).toHaveBeenCalledWith(1);
    });

    it("should delete item without image", async () => {
      const mockRequest = {
        params: { id: "1" },
      } as unknown as Request;

      mockItemService.getItemByID.mockResolvedValue({
        id: 1,
        name: "Arduino Uno",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC" as ItemCategory,
        categoryID: 1,
        imageUrl: null,
        assetIDs: null,
      });
      mockItemService.deleteItemByID.mockResolvedValue(undefined);

      await handler.deleteItemByID(mockRequest, mockResponse as Response);

      expect(mockS3Service.deleteFile).not.toHaveBeenCalled();
      expect(mockItemService.deleteItemByID).toHaveBeenCalledWith(1);
    });

    it("should still delete item if image deletion fails", async () => {
      const mockRequest = {
        params: { id: "1" },
      } as unknown as Request;

      mockItemService.getItemByID.mockResolvedValue({
        id: 1,
        name: "Arduino Uno",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC" as ItemCategory,
        categoryID: 1,
        imageUrl: "https://bucket.s3.region.amazonaws.com/uploads/1234567890-abc123.png",
        assetIDs: null,
      });
      mockS3Service.deleteFile.mockRejectedValue(new Error("S3 delete failed"));
      mockItemService.deleteItemByID.mockResolvedValue(undefined);

      await handler.deleteItemByID(mockRequest, mockResponse as Response);

      expect(mockS3Service.deleteFile).toHaveBeenCalled();
      expect(mockItemService.deleteItemByID).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe("updateItem with image", () => {
    it("should update item and upload new image", async () => {
      const mockFile = {
        buffer: Buffer.from("new-image-data"),
        mimetype: "image/jpeg",
        size: 2048,
        originalname: "new-image.jpg",
      };

      const mockRequest = {
        params: { id: "1" },
        body: {
          name: "Arduino Uno R3",
          description: "Updated description",
        },
        file: mockFile,
      } as unknown as Request;

      mockItemService.getItemByID.mockResolvedValue({
        id: 1,
        name: "Arduino Uno",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC" as ItemCategory,
        categoryID: 1,
        imageUrl: "https://bucket.s3.region.amazonaws.com/uploads/old-image.png",
        assetIDs: null,
      });
      mockS3Service.isValidImageType.mockReturnValue(true);
      mockS3Service.isValidFileSize.mockReturnValue(true);
      mockS3Service.uploadFile.mockResolvedValue("uploads/1234567890-newimage.png");
      mockS3Service.getPublicUrl.mockReturnValue("https://bucket.s3.region.amazonaws.com/uploads/1234567890-newimage.png");
      mockS3Service.deleteFile.mockResolvedValue(undefined);
      mockItemService.updateItem.mockResolvedValue({
        id: 1,
        name: "Arduino Uno R3",
        description: "Updated description",
        categoryName: "ELECTRONIC" as ItemCategory,
        categoryID: 1,
        imageUrl: "https://bucket.s3.region.amazonaws.com/uploads/1234567890-newimage.png",
        assetIDs: null,
      });

      await handler.updateItem(mockRequest, mockResponse as Response);

      expect(mockS3Service.deleteFile).toHaveBeenCalledWith("uploads/old-image.png");
      expect(mockS3Service.uploadFile).toHaveBeenCalled();
      expect(mockItemService.updateItem).toHaveBeenCalledWith(1, expect.objectContaining({
        imageUrl: "https://bucket.s3.region.amazonaws.com/uploads/1234567890-newimage.png",
      }));
    });

    it("should update item without changing image", async () => {
      const mockRequest = {
        params: { id: "1" },
        body: {
          name: "Arduino Uno R3",
        },
        file: undefined,
      } as unknown as Request;

      mockItemService.getItemByID.mockResolvedValue({
        id: 1,
        name: "Arduino Uno",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC" as ItemCategory,
        categoryID: 1,
        imageUrl: "https://bucket.s3.region.amazonaws.com/uploads/existing-image.png",
        assetIDs: null,
      });
      mockItemService.updateItem.mockResolvedValue({
        id: 1,
        name: "Arduino Uno R3",
        description: "Microcontroller board",
        categoryName: "ELECTRONIC" as ItemCategory,
        categoryID: 1,
        imageUrl: "https://bucket.s3.region.amazonaws.com/uploads/existing-image.png",
        assetIDs: null,
      });

      await handler.updateItem(mockRequest, mockResponse as Response);

      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
      expect(mockS3Service.deleteFile).not.toHaveBeenCalled();
    });
  });
});