import z, { infer, trim } from "zod";

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
  image_url: z.string().trim().optional(),
});

export const DeleteItem = z.coerce.number({ message: "ไอดีต้องเป็นตัวเลข" });

export type CreateItem = z.infer<typeof CreateItem>;
export type DeleteItem = z.infer<typeof DeleteItem>;
