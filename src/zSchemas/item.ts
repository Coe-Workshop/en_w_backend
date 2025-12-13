import z from "zod";

// export const Item = z.object({
//   id: z.number(),
//   name: z.string().trim(),
//   description: z.string().trim().optional(),
//   image_url: z.string().trim().optional(),
// });

export const CreateItemRequest = z.object({
  name: z
    .string({ error: "ต้องการชื่ออุปกรณ์" })
    .trim()
    .min(2, "ชื่ออุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(128, "ชื่อของอุปกรณ์ต้องห้ามเกิน 128 ตัวอักษร"),
  description: z.string().trim().optional(),
  category_name: z.string({ error: "ต้องการชื่อหมวดหมู่" }).trim(),
  image_url: z.string().trim().optional(),
});

export const DeleteItemRequest = z.coerce
  .number({ message: "ไอดีต้องเป็นตัวเลข" })
  .min(1, "ไอดีต้องมากกว่า 0")
  .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
  .int("ไอดีต้องเป็นจำนวนเต็ม");

export type CreateItemRequest = z.infer<typeof CreateItemRequest>;
export type DeleteItemRequest = z.infer<typeof DeleteItemRequest>;
