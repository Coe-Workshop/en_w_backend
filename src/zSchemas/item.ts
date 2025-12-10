import z from "zod";
import { categories } from "../db/schema";

// export const Item = z.object({
//   id: z.number(),
//   name: z.string().trim(),
//   description: z.string().trim().optional(),
//   image_url: z.string().trim().optional(),
// });

export const GetItemByIDRequest = z.object({});

export const CreateItemRequest = z.object({
  name: z
    .string({ message: "ต้องการชื่ออุปกรณ์" })
    .trim()
    .min(2, "ชื่ออุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(50, "ชื่อของอุปกรณ์ต้องห้ามเกิน 50 ตัวอักษร"),
  description: z.string().trim().optional(),
  category_ids: z
    .array(
      z
        .number("ID หมวดหมู่ต้องเป็นตัวเลข")
        .max(2147483647, "ไม่พบหมวดหมู่ดังกล่าว")
        .int("ID ต้องเป็นจำนนวนเต็ม")
        .positive("ID ห้ามติดลบ"),
    )
    .min(1, "ต้องเลือกอย่างน้อย 1 หมวดหมู่"),
  image_url: z.string().trim().optional(),
});

export const DeleteItemRequest = z.coerce
  .number({ message: "ไอดีต้องเป็นตัวเลข" })
  .min(1, "ไอดีต้องมากกว่า 0")
  .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
  .int("ไอดีต้องเป็นจำนวนเต็ม");

export const FilterItem = z.object({
  // change to enum
  category: z.coerce.number().optional(),
});

export type FilterItem = z.infer<typeof FilterItem>;
export type CreateItemRequest = z.infer<typeof CreateItemRequest>;
export type DeleteItemRequest = z.infer<typeof DeleteItemRequest>;
