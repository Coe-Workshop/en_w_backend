import { Request, Response } from "express";
import db from "../db";
import { users } from "../db/schema";
import { z } from "zod";
import {CreateUserRequest } from "../zSchemas/user";
import { eq, sql ,or,and } from "drizzle-orm";
import HttpStatus from "http-status";
import { error } from "console";


export const createUser = async (req: Request, res: Response) => {
  try {;
    const validatedData: CreateUserRequest = CreateUserRequest.parse(req.body);
    console.log(validatedData);
    const existing = await db 
      .select() 
      .from(users)
      .where(
        eq(users.email, validatedData.email)
      );
    if (existing.length > 0) {
      return  res.status(HttpStatus.CONFLICT).json({
        error: "มีผู้ใช้อีเมลนี้แล้ว",
      });
    }
    const insertUser = await db
      .insert(users)
      .values(
        validatedData
      )
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
