import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, s3Config } from "./s3.config";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

const generateUniqueKey = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalname);
  return `uploads/${timestamp}-${randomString}${ext}`;
};

export const s3Service = {
  isValidImageType: (mimetype: string): boolean => {
    return ALLOWED_IMAGE_TYPES.includes(mimetype);
  },

  isValidFileSize: (size: number, maxSize: number = MAX_FILE_SIZE): boolean => {
    return size <= maxSize;
  },

  uploadFile: async (
    fileBuffer: Buffer,
    mimetype: string,
    originalname: string
  ): Promise<string> => {
    try {
      console.log("DEBUG S3 Upload - Starting upload...");
      console.log("DEBUG S3 Upload - File:", { mimetype, originalname, size: fileBuffer.length });
      console.log("DEBUG S3 Upload - Bucket:", s3Config.bucketName);
      console.log("DEBUG S3 Upload - Region:", s3Config.region);
      
      const key = generateUniqueKey(originalname);
      console.log("DEBUG S3 Upload - Generated key:", key);

      const command = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
      });

      console.log("DEBUG S3 Upload - Sending command...");
      await s3Client.send(command);
      console.log("DEBUG S3 Upload - Success! Key:", key);
      return key;
    } catch (error) {
      console.error("DEBUG S3 Upload - ERROR:");
      console.error("Error name:", (error as Error).name);
      console.error("Error message:", (error as Error).message);
      console.error("Error stack:", (error as Error).stack);
      if ((error as any).Code) {
        console.error("AWS Error Code:", (error as any).Code);
      }
      if ((error as any).$metadata) {
        console.error("AWS Metadata:", (error as any).$metadata);
      }
      throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
  },

  deleteFile: async (key: string): Promise<void> => {
    try {
      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      throw new Error("Failed to delete file");
    }
  },

  getFileUrl: async (key: string, expiresIn: number = 3600): Promise<string> => {
    try {
      const command = new GetObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      throw new Error("Failed to get file URL");
    }
  },

  getPublicUrl: (key: string): string => {
    return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
  },
};
