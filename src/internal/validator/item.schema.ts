import z from "zod";

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

export const ItemIdRequest = z.coerce
  .number({ error: "ไอดีต้องเป็นตัวเลข" })
  .min(1, "ไอดีต้องมากกว่า 0")
  .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
  .int("ไอดีต้องเป็นจำนวนเต็ม");

export const UpdateItemRequest = z
  .object({
    name: z
      .string("ชื่ออุปกรณ์ต้องเป็นตัวอักษร")
      .trim()
      .min(2, "ชื่ออุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(128, "ชื่อของอุปกรณ์ต้องห้ามเกิน 128 ตัวอักษร")
      .optional(),
    description: z.string("คำออธิบายต้องเป็นตัวอักษร").trim().optional(),
    category_name: z.string("ไม่พบหมวดหมู่ที่ระบุ").trim().optional(),
    assets_id: z
      .string("เลขครุภัณฑ์ต้องเป็นตัวอักษร")
      .trim()
      .nonempty("เลขครุภัณฑ์ห้ามว่างเปล่า")
      .optional(),
    image_url: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "ต้องการข้อมูลอย่างน้อย 1 อย่างสำหหรับการอัพเดต",
  });

export type CreateItemRequest = z.infer<typeof CreateItemRequest>;
export type ItemIdRequest = z.infer<typeof ItemIdRequest>;
export type UpdateItemRequest = z.infer<typeof UpdateItemRequest>;
