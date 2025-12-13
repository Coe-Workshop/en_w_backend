import e, { Request, Response } from "express";
import db from "../db";
import { users } from "../db/schema";
import { z } from "zod";
import {CreateUserRequest } from "../zSchemas/user";
import { eq, sql ,or,and } from "drizzle-orm";
import HttpStatus from "http-status";
import { error } from "console";
import { use } from "passport";

/*
export const deleteUser = async (req: Request, res: Response) => {
  try {;
    const validatedData: CreateUserRequest = CreateUserRequest.parse(req.body);

    const check_Same_Data = await db
      .select()
      .from(users)
      .where(
        and (
          eq(users.email, validatedData.email),
          eq(users.first_name, validatedData.first_name),
          eq(users.last_name, validatedData.last_name),
          eq(users.faculty, validatedData.faculty),
          eq(users.role, validatedData.role),
          eq(users.phone, validatedData.phone)
        )
      );

    if (check_Same_Data.length > 0) {
      const deleteUser = await db
      .delete(users)
      .where(eq(users.email, validatedData.email))
      .returning();
      return res.status(HttpStatus.OK).json(deleteUser[0]);
    }
  

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: "กรุณาตรวจสอบข้อมูล",
      });
    }
  }
};
*/

export const updateUser = async (req: Request, res: Response) => {
  try {;
    const validatedData: CreateUserRequest = CreateUserRequest.parse(req.body);
    console.log(validatedData);
    const check_Email = await db 
      .select() 
      .from(users)
      .where(
        eq(users.email, validatedData.email)
      );
    const check_Same_Data = await db
      .select()
      .from(users)
      .where(
        and (
          eq(users.first_name, validatedData.first_name),
          eq(users.last_name, validatedData.last_name),
          eq(users.faculty, validatedData.faculty),
          eq(users.role, validatedData.role),
          eq(users.phone, validatedData.phone)
        )
      );

    if (check_Email.length > 0 && check_Same_Data.length == 0) {
      const updateUser = await db
      .update(users)
      .set(validatedData)
      .returning();
      return res.status(HttpStatus.OK).json(updateUser[0]);
    }
    else if (check_Same_Data.length > 0 && check_Email.length > 0){
      return res.status(HttpStatus.OK).json({
        message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
      });
    }

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: "กรุณาตรวจสอบข้อมูล",
      });
    }
  }
};


export const createUser = async (req: Request, res: Response) => {
  try {;
    const validatedData: CreateUserRequest = CreateUserRequest.parse(req.body);
    console.log("validatedData");
    
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
    console.log("inserting user");
    const insertUser = await db
      .insert(users)
      .values(
        validatedData
      )
      .returning();
      console.log("inserted user");
    return res.status(HttpStatus.CREATED).json(insertUser[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: "กรุณาตรวจสอบข้อมูล",
      });
    }
  }
};
