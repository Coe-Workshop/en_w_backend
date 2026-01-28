import z from "zod";

export const CreateTransactionRequest = z
  .object(
    {
      assetID: z
        .string("กรุณาเลือกเลขครุภัณฑ์ของอุปกรณ์ที่ต้องการจอง")
        .trim()
        .min(1, "เลขครุภัณฑ์ห้ามว่าง")
        .max(64, "ไม่พบเลขครุภัณฑ์ดังกล่าว"),
      reserverID: z
        .string("ต้องการ uuid ของผู้จอง")
        .trim()
        .length(36, "รูปแบบของ uuid ไม่ถูกต้อง"),
      date: z
        .string("กรุณาเลือกวันที่จอง")
        .trim()
        .pipe(
          z.iso.date("ไม่มีวันที่ดังกล่าว หรือรูปแบบไม่ถูกต้อง (YYYY-MM-DD)"),
        ),
      startedAt: z
        .string("กรุณาเลือกเวลาเริ่มใช้งานอุปกรณ์")
        .trim()
        .pipe(z.iso.time("ไม่มีเวลาดังกล่าว หรือรูปแบบไม่ถูกต้อง (HH:MM)")),
      endedAt: z
        .string("กรุณาเลือกเวลาสิ้นสุดการใช้งานอุปกรณ์")
        .trim()
        .pipe(z.iso.time("ไม่มีเวลาดังกล่าว หรือรูปแบบไม่ถูกต้อง (HH:MM)")),
      message: z
        .string({
          error: (issue) =>
            issue.input === undefined
              ? "กรุณากรอกจุดประสงค์ของการจอง"
              : "ข้อความต้องเป็นตัวอักษร",
        })
        .min(1, "ข้อความห้ามว่าง")
        .max(1000, "ข้อความยาวเกินไป"),
    },
    {
      error: (issue) => {
        if (issue.input === undefined) {
          return "กรุณากรอกข้อมูลเพื่อทำรายการจอง";
        }
      },
    },
  )
  .refine((data) => data.endedAt > data.startedAt, {
    error: "เวลาสิ้นสุดการจองต้องมากกว่าเวลาเริ่มต้นการจอง",
  })
  .transform((data) => ({
    assetID: data.assetID,
    reserverID: data.reserverID,
    message: data.message,
    startedAt: new Date(`${data.date}T${data.startedAt}:00Z`),
    endedAt: new Date(`${data.date}T${data.endedAt}:00Z`),
  }));

export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequest>;
