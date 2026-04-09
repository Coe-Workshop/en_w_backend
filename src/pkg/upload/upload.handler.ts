import { Request, Response, Router } from "express";
import HttpStatus from "http-status";
import { s3Service } from "./s3.service";

const uploadHandler = () => ({
  uploadImage: async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: "No file uploaded",
        });
      }

      const { buffer, mimetype, size, originalname } = req.file;

      if (!s3Service.isValidImageType(mimetype)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: "Invalid file type. Only images are allowed (png, jpg, jpeg, gif, webp)",
        });
      }

      if (!s3Service.isValidFileSize(size)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: "File size exceeds maximum limit of 5MB",
        });
      }

      const key = await s3Service.uploadFile(buffer, mimetype, originalname);
      const url = s3Service.getPublicUrl(key);

      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: {
          key,
          url,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Failed to upload image",
      });
    }
  },

  deleteImage: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key } = req.params;

      await s3Service.deleteFile(key);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Failed to delete image",
      });
    }
  },

  getImageUrl: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { key } = req.params;

      const url = await s3Service.getFileUrl(key);

      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          url,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Failed to get image URL",
      });
    }
  },
});

export const makeUploadHandler = () => {
  const router = Router();
  const handler = uploadHandler();

  router.post("/image", handler.uploadImage);
  router.delete("/image/:key", handler.deleteImage);
  router.get("/image/:key", handler.getImageUrl);

  return router;
};

export { uploadHandler };