import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "S3_BUCKET_NAME",
];

console.log("DEBUG S3 Config - Loading environment variables...");
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  console.log(`DEBUG S3 Config - ${envVar}:`, value ? "✓ Set" : "✗ Missing");
  if (!value) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const s3Config = {
  region: process.env.AWS_REGION!,
  bucketName: process.env.S3_BUCKET_NAME!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  isPublic: process.env.S3_BUCKET_PUBLIC === "true",
};

console.log("DEBUG S3 Config - Configuration loaded successfully");
console.log("DEBUG S3 Config - Bucket:", s3Config.bucketName);
console.log("DEBUG S3 Config - Region:", s3Config.region);
console.log("DEBUG S3 Config - Access Key (first 5 chars):", s3Config.accessKeyId.substring(0, 5) + "...");

export const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});