import z from "zod";

export const GetTransactionByItemIdRequest = z.coerce
  .number({
    error: (issue) =>
      issue.input === undefined
        ? "กรุณาบอกไอดีของอุปกรณ์"
        : "เลขอุปกรณ์ต้องเป็นตัวเลข",
  })
  .min(1, "ไอดีของอุปกรณ์ต้องมากกว่า 0")
  .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
  .int("ไอดีของอุปกรณ์ต้องเป็นจำนวนเต็ม");

export const GetAllTransactionsByUserRequest = z
  .string("ต้องการ uuid ของ user")
  .trim()
  .uuid("รูปแบบของ uuid ไม่ถูกต้อง");

export const CreateTransactionRequest = z
  .object(
    {
      assetID: z
        .number("กรุณาเลือกเลขครุภัณฑ์ของอุปกรณ์ที่ต้องการจอง")
        .min(1, "ไอดีของเลชครุภัณฑ์ต้องมากกว่า 0")
        .max(2147483647, "ไม่พบเลขครุภัณฑ์ดังกล่าว")
        .int("ไอดีของเลชครุภัณฑ์ต้องเป็นจำนวนเต็ม"),
      itemID: z
        .number("กรุณาระบุไอดีของอุปกรณ์")
        .min(1, "ไอดีของอุปกรณ์ต้องมากกว่า 0")
        .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
        .int("ไอดีของอุปกรณ์ต้องเป็นจำนวนเต็ม"),
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
  .refine(
    (data) =>
      new Date(data.date).setHours(0, 0, 0, 0) >=
      new Date().setHours(0, 0, 0, 0),
    {
      error: "ไม่สามารถจองวันที่ในอดีตได้",
    },
  )
  .refine((data) => data.startedAt >= "09:00" && data.endedAt <= "16:00", {
    error: "ไม่สามารถจองนอกเวลาทำการได้  (09:00 น. ถึง 16:00 น.)",
  })
  .transform((data) => ({
    assetID: data.assetID,
    itemID: data.itemID,
    reserverID: data.reserverID,
    message: data.message,
    startedAt: new Date(`${data.date}T${data.startedAt}:00Z`),
    endedAt: new Date(`${data.date}T${data.endedAt}:00Z`),
  }));

export const GetAllTransactionsByDateRequest = z
  .string("กรุณาเลือกวันที่จะดูรายการจอง")
  .trim()
  .pipe(z.iso.date("ไม่มีวันที่ดังกล่าว หรือรูปแบบไม่ถูกต้อง (YYYY-MM-DD)"))
  .transform((data) => ({
    date: new Date(`${data}T00:00:00Z`),
  }));

export const pageNumberRequest = z.coerce
  .number("pageNumber ต้องเป็นตัวเลข")
  .min(1, "pageNumber ต้องมากกว่า 0")
  .int("pageNumber ต้องเป็นจำนนวนเต็ม");

export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequest>;
export type GetAllTransactionsByDateRequest = z.infer<
  typeof GetAllTransactionsByDateRequest
>;
export type pageNumberRequest = z.infer<typeof pageNumberRequest>;

export type GetTransactionByItemIdRequest = z.infer<
  typeof GetTransactionByItemIdRequest
>;
export type GetAllTransactionsByUserRequest = z.infer<
  typeof GetAllTransactionsByUserRequest
>;
