import { Request, Response } from "express";
import { pool } from "../db/database";
import { ToolCategory } from "../types/tool";

export const createTool = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {
      tool_id,
      name,
      description,
      category,
      available_quantity,
      total_quantity,
    } = req.body;

    if (!tool_id) {
      return res.status(422).json({ error: "tool id is required" });
    }
    if (!name) {
      return res.status(422).json({ error: "name is required" });
    }
    if (!category) {
      return res.status(422).json({ error: "category is required" });
    } else if (
      !Object.values(ToolCategory).includes(category as ToolCategory)
    ) {
      return res.status(422).json({ error: "Category not found" });
    }

    if (total_quantity < 0 || available_quantity < 0) {
      return res.status(422).json({
        error: "total_quantity and available_quantity must be positive number",
      });
    }

    const result = await pool.query({
      text: "INSERT INTO tools (tool_id, name, description, category, available_quantity, total_quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      values: [
        tool_id,
        name,
        description,
        category,
        available_quantity,
        total_quantity,
      ],
    });

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};

export const updateTool = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { tool_id, name, description, category, total_quantity } = req.body;

    const isExisted = await pool.query({
      text: "SELECT EXISTS(SELECT 1 FROM tools WHERE id = $1)",
      values: [id],
    });
    if (!isExisted.rows[0].exists) {
      return res.status(404).json({ error: "Tool not found" });
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (tool_id !== undefined) {
      updateFields.push(`tool_id = $${paramCount}`);
      values.push(tool_id);
      paramCount++;
    }
    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (category !== undefined) {
      const isCategoryExisted = Object.values(ToolCategory).includes(
        category as ToolCategory,
      );
      if (!isCategoryExisted) {
        return res.status(422).json({ error: "Category not found" });
      }
      updateFields.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }
    // ?????????????????????????????????????????????????????????????????
    if (total_quantity !== undefined) {
      if (total_quantity < 0) {
        return res.status(422).json({
          error: "total_quantity must be positive number",
        });
      }
      updateFields.push(`total_quantity = $${paramCount}`);
      values.push(total_quantity);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updateFields.push(`updated_date = CURRENT_TIMESTAMP`);

    values.push(id);

    const result = await pool.query({
      text: `UPDATE tools SET ${updateFields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values: values,
    });

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};

export const deleteTool = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    const isExisted = await pool.query({
      text: "SELECT EXISTS(SELECT 1 FROM tools WHERE id = $1)",
      values: [id],
    });

    if (!isExisted.rows[0].exists) {
      return res.status(404).json({ error: "Tool not found" });
    }

    const result = await pool.query({
      text: "DELETE FROM tools WHERE id = $1 RETURNING *",
      values: [id],
    });

    return res.status(200).json({
      message: "Tool deleted successfully",
      tool: result.rows[0],
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({ error: err.message });
  }
};
