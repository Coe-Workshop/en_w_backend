import z from "zod";

export const GetApprovedBookingsByItemRequest = z.object({
  itemId: z.coerce
    .number("ไอดีของอุปกณ์ต้องเป็นตัวเลข")
    .min(1, "ไอดีของอุปกณ์ต้องมากกว่า 0")
    .max(2147483647, "ไม่พบอุปกณ์ดังกล่าว")
    .int("ไอดีของอุปกณ์ต้องเป็นจำนวนเต็ม"),
  date: z
    .string("กรุณาเลือกวันที่จอง")
    .trim()
    .pipe(z.iso.date("ไม่มีวันที่ดังกล่าว หรือรูปแบบไม่ถูกต้อง (YYYY-MM-DD)")),
});

export const GetReservedByItemRequest = z.object({
  itemId: z.coerce
    .number("ไอดีของอุปกณ์ต้องเป็นตัวเลข")
    .min(1, "ไอดีของอุปกณ์ต้องมากกว่า 0")
    .max(2147483647, "ไม่พบอุปกณ์ดังกล่าว")
    .int("ไอดีของอุปกณ์ต้องเป็นจำนวนเต็ม"),
  date: z
    .string("กรุณาเลือกวันที่จอง")
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"),
});

export const GetAllTransactionsByUserRequest = z.object({
  user: z.string().uuid("รูปแบบของ uuid ไม่ถูกต้อง").optional(),
  userName: z.string().trim().min(1).optional(),
}).refine((data) => data.user || data.userName, {
  message: "ต้องระบุ user (uuid) หรือ userName",
});

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
    (data) => {
      const inputDate = new Date(data.date);
      const nowUTC = new Date();
      return inputDate >= nowUTC;
    },
    {
      error: "ไม่สามารถจองวันเวลาในอดีตได้",
    },
  )
  .transform((data) => ({
    assetID: data.assetID,
    itemID: data.itemID,
    reserverID: data.reserverID,
    message: data.message,
    startedAt: new Date(`${data.date}T${data.startedAt}:00Z`),
    endedAt: new Date(`${data.date}T${data.endedAt}:00Z`),
  }))
  .refine((data) => {
    const thaiOffset = 7 * 60 * 60 * 1000;
    const startedAtThai = new Date(data.startedAt.getTime() + thaiOffset);
    const endedAtThai = new Date(data.endedAt.getTime() + thaiOffset);
    const startHour = startedAtThai.getUTCHours();
    const endHour = endedAtThai.getUTCHours();
    const endMinute = endedAtThai.getUTCMinutes();
    return startHour >= 9 && (endHour < 16 || (endHour === 16 && endMinute === 0));
  }, {
    error: "ไม่สามารถจองนอกเวลาทำการได้  (09:00 น. ถึง 16:00 น.)",
  });

export const GetAllTransactionsByStatusRequest = z.object({
  status: z.enum(["APPROVE", "REJECT", "RESERVE"]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)").optional(),
  userName: z.string().trim().min(1).optional(),
});

export const pageNumberRequest = z.coerce
  .number("pageNumber ต้องเป็นตัวเลข")
  .min(1, "pageNumber ต้องมากกว่า 0")
  .int("pageNumber ต้องเป็นจำนนวนเต็ม");

export const UpdateTransactionByIdRequest = z.object({
  transactionId: z.coerce
    .number("id ของการจองต้องเป็นตัวเลข")
    .min(1, "id ของการจองต้องมากกว่า 0")
    .max(2147483647, "ไม่พบการจองดังกล่าว")
    .int("id ของการจองต้องเป็นจำนวนเต็ม"),
  isApproved: z.boolean({
    error: (issue) =>
      issue.input === undefined
        ? "กรุณาระบุสถานะการอนุมัติ"
        : "ค่าสถานะการอนุมัติต้องเป็น true หรือ false เท่านั้น",
  }),
  approverID: z
    .string("ไม่พบ uuid ของ admin")
    .trim()
    .uuid("รูปแบบของ uuid ไม่ถูกต้อง"),
  message: z
    .string("ข้อความถึงผู้จองต้องเป็นตัวอักษร")
    .trim()
    .max(1000, "ข้อความต้องมีความยาวไม่เกิน 1000 ตัวอักษร")
    .optional(),
});

export const UpdateAllTransactionByUserRequest = z.object({
  approverID: z
    .string("ไม่พบ uuid ของ admin")
    .trim()
    .uuid("รูปแบบของ uuid ไม่ถูกต้อง"),
  reserverID: z
    .string("ต้องการ uuid ของผู้จอง")
    .trim()
    .uuid("รูปแบบของ uuid ไม่ถูกต้อง"),
  isApproved: z.boolean({
    error: (issue) =>
      issue.input === undefined
        ? "กรุณาระบุสถานะการอนุมัติ"
        : "ค่าสถานะการอนุมัติต้องเป็น true หรือ false เท่านั้น",
  }),
  message: z
    .string("ข้อความถึงผู้จองต้องเป็นตัวอักษร")
    .trim()
    .max(1000, "ข้อความต้องมีความยาวไม่เกิน 1000 ตัวอักษร")
    .optional(),
});

export const CancelTransactionRequest = z.object({
  id: z.coerce
    .number("id ของการจองต้องเป็นตัวเลข")
    .min(1, "id ของการจองต้องมากกว่า 0")
    .max(2147483647, "ไม่พบการจองดังกล่าว")
    .int("id ของการจองต้องเป็นจำนวนเต็ม"),
  reserverID: z
    .string("ต้องการ uuid ของผู้จอง")
    .trim()
    .uuid("รูปแบบของ uuid ไม่ถูกต้อง"),
});

export const CheckTransactionConflictRequest = z.object({
  transactionId: z
    .array(
      z
        .number("id ของการจองต้องเป็นตัวเลข")
        .min(1, "id ของการจองต้องมากกว่า 0")
        .max(2147483647, "ไม่พบการจองที่ระบุ")
        .int("id ของการจองต้องเป็นจำนวนเต็ม"),
    )
    .min(1, "ต้องการ id ของการจองเพื่อตรวจสอบการจอง"),
});

export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequest>;
export type GetAllTransactionsByStatusRequest = z.infer<
  typeof GetAllTransactionsByStatusRequest
>;
export type pageNumberRequest = z.infer<typeof pageNumberRequest>;

export type GetApprovedBookingsByItemRequest = z.infer<
  typeof GetApprovedBookingsByItemRequest
>;
export type GetReservedByItemRequest = z.infer<typeof GetReservedByItemRequest>;
export type GetAllTransactionsByUserRequest = z.infer<
  typeof GetAllTransactionsByUserRequest
>;
export type UpdateTransactionByIdRequest = z.infer<
  typeof UpdateTransactionByIdRequest
>;
export type UpdateAllTransactionByUserRequest = z.infer<
  typeof UpdateAllTransactionByUserRequest
>;
export type CancelTransactionRequest = z.infer<typeof CancelTransactionRequest>;
export type CheckTransactionConflictRequest = z.infer<
  typeof CheckTransactionConflictRequest
>;
