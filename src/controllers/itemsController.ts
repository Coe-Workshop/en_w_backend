import { Request, Response } from "express";

export const getAllItems = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  return res.status(200).json([]);
};

// export const createItem = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//   } catch (error) {}
// };
