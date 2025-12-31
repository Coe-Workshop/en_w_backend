import z from "zod";

export const CreateItemRequest = z.object({
  name: z
    .string("ชื่ออุปกรณ์ต้องเป็นตัวอักษร")
    .trim()
    .min(2, "ชื่ออุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(128, "ชื่อของอุปกรณ์ต้องห้ามเกิน 128 ตัวอักษร"),
  description: z.string("คำอธิบายต้องเป็นตัวอักษร").trim().optional(),
  category_name: z
    .string("ชื่อหมวดหมู่ต้องเป็นตัวอักษร")
    .trim()
    .toUpperCase()
    .nonempty("หมวดหมู่ไม่สามารถว่างได้"),
  image_url: z.string().trim().optional(),
});

export const ItemIdRequest = z.coerce
  .number("ไอดีของอุปกรณ์ต้องเป็นตัวเลข")
  .min(1, "ไอดีของอุปกรณ์ต้องมากกว่า 0")
  .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
  .int("ไอดีของอุปกรณ์ต้องเป็นจำนวนเต็ม");

export const UpdateItemRequest = z
  .object({
    name: z
      .string("ชื่ออุปกรณ์ต้องเป็นตัวอักษร")
      .trim()
      .min(2, "ชื่ออุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(128, "ชื่อของอุปกรณ์ต้องห้ามเกิน 128 ตัวอักษร")
      .optional(),
    description: z.preprocess(
      (val) => (val === "" ? ("อุปกรณ์ชิ้นนี้ไม่มีคำอธิบาย" as string) : val),
      z.string("คำอธิบายต้องเป็นตัวอักษร").trim().optional(),
    ),
    category_name: z
      .string("ชื่อหมวดหมู่ต้องเป็นตัวอักษร")
      .trim()
      .toUpperCase()
      .nonempty("หมวดหมู่ไม่สามารถว่างได้")
      .optional(),
    image_url: z.string("url ของรูปภาพต้องเป็นตัวอักษร").trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "ต้องการข้อมูลอย่างน้อย 1 อย่างสำหหรับการอัพเดต",
  });

export type CreateItemRequest = z.infer<typeof CreateItemRequest>;
export type ItemIdRequest = z.infer<typeof ItemIdRequest>;
export type UpdateItemRequest = z.infer<typeof UpdateItemRequest>;
