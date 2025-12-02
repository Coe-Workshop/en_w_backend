import { Request, Response } from "express";
import db from "../db/index";
import { users, User, NewUser } from "../db/schema/users";
import { messages } from "../db/schema/messages";
import { eq } from "drizzle-orm";
import { categories, itemsToCategories } from "../db/schema";

export const createUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { first_name, last_name, email, role }: NewUser = req.body;
    const result = await db
      .insert(users)
      .values({
        first_name: first_name,
        last_name: last_name,
        email: email,
        role: role,
      })
      .returning();
    return res.status(201).json({
      message: "User created successfully!",
      user: result[0],
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const result = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();
    return res.status(200).json({
      message: "user deleted successfully!",
      user: result[0],
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const cleanUpdateData: Partial<NewUser> = {};
    const { first_name, last_name, email, role } = req.body;
    if (first_name !== undefined) cleanUpdateData.first_name = first_name;
    if (last_name !== undefined) cleanUpdateData.last_name = last_name;
    if (email !== undefined) cleanUpdateData.email = email;
    if (role !== undefined) cleanUpdateData.role = role;
    const result = await db
      .update(users)
      .set(cleanUpdateData)
      .where(eq(users.id, parseInt(id)))
      .returning();
    return res.status(200).json({
      message: "user updated successfully!",
      user: result[0],
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};

export const getYOURcomment = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const result = await db.query.messages.findMany({
      where: eq(messages.user_id, parseInt(id)),
    });
    return res.status(200).json({
      message: "get HIS messages successfully",
      his_messages: result,
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};

export const getTHIScategories = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const result = await db.query.itemsToCategories.findMany({
      where: eq(itemsToCategories.item_id, parseInt(id)),
      columns: {},
      with: {
        item: {
          columns: {
            name: true,
            description: true,
          },
        },
        category: {
          columns: {
            name: true,
          },
        },
      },
    });
    return res.status(200).json({
      message: "get ALL categories for this tool successfully",
      categories: result,
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};
