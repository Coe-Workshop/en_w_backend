import { Request, Response } from "express";
import db from "../db";
import { users } from "../db/schema";
import { z } from "zod";
import { CreateAssetRequest } from "../zSchemas/user";
import { eq, sql } from "drizzle-orm";
import HttpStatus from "http-status";

export const createUser = async (req: Request, res: Response) => {
  try {
    console.log("test");
    const { email, first_name, last_name, role, created_at, deleted_at } =
      req.body;

    const insertUser = await db
      .insert(users)
      .values({
        first_name,
        last_name,
        email,
        role,
        created_at,
        deleted_at,
      })
      .returning();

    return res.status(HttpStatus.CREATED).json(insertUser[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: "กรุณาตรวจสอบข้อมูล",
      });
    }
  }
};
