import { Request, Response } from "express";
import { uploadHandler } from "@/pkg/upload/upload.handler";
import { s3Service } from "@/pkg/upload/s3.service";

// Mock s3Service
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

describe("Upload Handler", () => {
  let mockResponse: Partial<Response>;
  let handler: ReturnType<typeof uploadHandler>;
  let mockS3Service: jest.Mocked<typeof s3Service>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockS3Service = s3Service as jest.Mocked<typeof s3Service>;
    handler = uploadHandler();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("uploadImage", () => {
    it("should upload image successfully", async () => {
      const mockFile = {
        buffer: Buffer.from("test-image-data"),
        mimetype: "image/png",
        size: 1024,
        originalname: "test-image.png",
      };

      const mockRequest = {
        file: mockFile,
      } as unknown as Request;

      mockS3Service.isValidImageType.mockReturnValue(true);
      mockS3Service.isValidFileSize.mockReturnValue(true);
      mockS3Service.uploadFile.mockResolvedValue("uploads/test-image-123.png");
      mockS3Service.getPublicUrl.mockReturnValue("https://s3.amazonaws.com/bucket/uploads/test-image-123.png");

      await handler.uploadImage(mockRequest, mockResponse as Response);

      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.mimetype,
        mockFile.originalname
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          key: "uploads/test-image-123.png",
          url: "https://s3.amazonaws.com/bucket/uploads/test-image-123.png",
        },
      });
    });

    it("should return error if no file provided", async () => {
      const mockRequest = {} as Request;

      await handler.uploadImage(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "No file uploaded",
      });
    });

    it("should return error for invalid image type", async () => {
      const mockFile = {
        buffer: Buffer.from("test-data"),
        mimetype: "application/pdf",
        size: 1024,
        originalname: "test.pdf",
      };

      const mockRequest = {
        file: mockFile,
      } as unknown as Request;

      mockS3Service.isValidImageType.mockReturnValue(false);

      await handler.uploadImage(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid file type. Only images are allowed (png, jpg, jpeg, gif, webp)",
      });
    });

    it("should return error if file size exceeds limit", async () => {
      const mockFile = {
        buffer: Buffer.from("test-data"),
        mimetype: "image/png",
        size: 10 * 1024 * 1024, // 10MB
        originalname: "large-image.png",
      };

      const mockRequest = {
        file: mockFile,
      } as unknown as Request;

      mockS3Service.isValidImageType.mockReturnValue(true);
      mockS3Service.isValidFileSize.mockReturnValue(false);

      await handler.uploadImage(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "File size exceeds maximum limit of 5MB",
      });
    });

    it("should return error if S3 upload fails", async () => {
      const mockFile = {
        buffer: Buffer.from("test-image-data"),
        mimetype: "image/png",
        size: 1024,
        originalname: "test-image.png",
      };

      const mockRequest = {
        file: mockFile,
      } as unknown as Request;

      mockS3Service.isValidImageType.mockReturnValue(true);
      mockS3Service.isValidFileSize.mockReturnValue(true);
      mockS3Service.uploadFile.mockRejectedValue(new Error("S3 upload failed"));

      await handler.uploadImage(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Failed to upload image",
      });
    });
  });

  describe("deleteImage", () => {
    it("should delete image successfully", async () => {
      const mockRequest = {
        params: { key: "uploads/test-image.png" },
      } as unknown as Request;

      mockS3Service.deleteFile.mockResolvedValue(undefined);

      await handler.deleteImage(mockRequest, mockResponse as Response);

      expect(mockS3Service.deleteFile).toHaveBeenCalledWith("uploads/test-image.png");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Image deleted successfully",
      });
    });

    it("should return error if deletion fails", async () => {
      const mockRequest = {
        params: { key: "uploads/test-image.png" },
      } as unknown as Request;

      mockS3Service.deleteFile.mockRejectedValue(new Error("S3 delete failed"));

      await handler.deleteImage(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Failed to delete image",
      });
    });
  });

  describe("getImageUrl", () => {
    it("should return signed URL for image", async () => {
      const mockRequest = {
        params: { key: "uploads/test-image.png" },
      } as unknown as Request;

      mockS3Service.getFileUrl.mockResolvedValue("https://s3.amazonaws.com/bucket/uploads/test-image.png?signature=abc");

      await handler.getImageUrl(mockRequest, mockResponse as Response);

      expect(mockS3Service.getFileUrl).toHaveBeenCalledWith("uploads/test-image.png");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          url: "https://s3.amazonaws.com/bucket/uploads/test-image.png?signature=abc",
        },
      });
    });

    it("should return error if getting URL fails", async () => {
      const mockRequest = {
        params: { key: "uploads/test-image.png" },
      } as unknown as Request;

      mockS3Service.getFileUrl.mockRejectedValue(new Error("S3 error"));

      await handler.getImageUrl(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Failed to get image URL",
      });
    });
  });
});