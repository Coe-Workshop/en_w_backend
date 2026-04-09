// Set required env vars before importing s3.service
process.env.AWS_ACCESS_KEY_ID = "test-access-key";
process.env.AWS_SECRET_ACCESS_KEY = "test-secret-key";
process.env.AWS_REGION = "us-east-1";
process.env.S3_BUCKET_NAME = "test-bucket";

import { s3Service } from "@/pkg/upload/s3.service";

describe("S3 Service Validation", () => {
  describe("isValidImageType", () => {
    it("should accept valid image types", () => {
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
      
      validTypes.forEach((type) => {
        expect(s3Service.isValidImageType(type)).toBe(true);
      });
    });

    it("should reject invalid image types", () => {
      const invalidTypes = ["image/svg+xml", "application/pdf", "text/html", "video/mp4", "image/bmp"];
      
      invalidTypes.forEach((type) => {
        expect(s3Service.isValidImageType(type)).toBe(false);
      });
    });

    it("should be case sensitive", () => {
      expect(s3Service.isValidImageType("IMAGE/PNG")).toBe(false);
      expect(s3Service.isValidImageType("Image/Jpeg")).toBe(false);
    });
  });

  describe("isValidFileSize", () => {
    it("should accept files within default max size", () => {
      expect(s3Service.isValidFileSize(1024)).toBe(true); // 1KB
      expect(s3Service.isValidFileSize(1024 * 1024)).toBe(true); // 1MB
      expect(s3Service.isValidFileSize(5 * 1024 * 1024)).toBe(true); // 5MB (exactly at limit)
    });

    it("should reject files larger than default max size", () => {
      expect(s3Service.isValidFileSize(6 * 1024 * 1024)).toBe(false); // 6MB
      expect(s3Service.isValidFileSize(10 * 1024 * 1024)).toBe(false); // 10MB
    });

    it("should accept files within custom max size", () => {
      const customMaxSize = 10 * 1024 * 1024; // 10MB
      
      expect(s3Service.isValidFileSize(5 * 1024 * 1024, customMaxSize)).toBe(true); // 5MB
      expect(s3Service.isValidFileSize(10 * 1024 * 1024, customMaxSize)).toBe(true); // 10MB (exactly at limit)
    });

    it("should reject files larger than custom max size", () => {
      const customMaxSize = 1 * 1024 * 1024; // 1MB
      
      expect(s3Service.isValidFileSize(2 * 1024 * 1024, customMaxSize)).toBe(false); // 2MB
    });

    it("should handle edge cases", () => {
      expect(s3Service.isValidFileSize(0)).toBe(true); // Zero size
      expect(s3Service.isValidFileSize(-1)).toBe(true); // Negative size (edge case)
    });
  });

  describe("getPublicUrl", () => {
    it("should return properly formatted URL", () => {
      const key = "uploads/test-image.png";
      const url = s3Service.getPublicUrl(key);

      expect(url).toContain("test-bucket");
      expect(url).toContain("us-east-1");
      expect(url).toContain("amazonaws.com");
      expect(url).toContain(key);
    });

    it("should handle keys with special characters", () => {
      const key = "uploads/test-image-123_abc.png";
      const url = s3Service.getPublicUrl(key);

      expect(url).toContain(key);
    });

    it("should handle nested paths", () => {
      const key = "uploads/2024/01/test-image.png";
      const url = s3Service.getPublicUrl(key);

      expect(url).toContain(key);
    });
  });
});