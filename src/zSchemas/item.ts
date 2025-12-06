import z from "zod";

// export const Item = z.object({
//   id: z.number(),
//   name: z.string().trim(),
//   description: z.string().trim().optional(),
//   image_url: z.string().trim().optional(),
// });

export const CreateItem = z.object({
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

export const DeleteItem = z.coerce
  .number({ message: "ไอดีต้องเป็นตัวเลข" })
  .min(1, "ไอดีต้องมากกว่า 0")
  .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
  .int("ไอดีต้องเป็นจำนวนเต็ม");

export type CreateItem = z.infer<typeof CreateItem>;
export type DeleteItem = z.infer<typeof DeleteItem>;
