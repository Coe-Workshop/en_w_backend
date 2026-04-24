import z from "zod";

export const CreateReportRequest = z.object({
  type: z.enum(["BUG", "FEATURE", "FEEDBACK"], {
    error: "กรุณาเลือกประเภทของรายงาน",
  }),
  title: z.string()
    .trim()
    .min(2, "หัวข้อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(256, "หัวข้อต้องไม่เกิน 256 ตัวอักษร"),
  description: z.string()
    .trim()
    .min(10, "คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(5000, "คำอธิบายต้องไม่เกิน 5000 ตัวอักษร"),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
});

export const UpdateReportStatusRequest = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"], {
    error: "สถานะไม่ถูกต้อง",
  }),
});

export type CreateReportRequest = z.infer<typeof CreateReportRequest>;
export type UpdateReportStatusRequest = z.infer<typeof UpdateReportStatusRequest>;