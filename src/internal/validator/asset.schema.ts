import z from "zod";

export const CreateAssetRequest = z.object(
  {
    itemID: z.coerce
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "กรุณากรอกไอดีของอุปกรณ์"
            : "เลขอุปกรณ์ต้องเป็นตัวเลข",
      })
      .min(1, "ไอดีของอุปกรณ์ต้องมากกว่า 0")
      .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
      .int("ไอดีของอุปกรณ์ต้องเป็นจำนวนเต็ม"),

    assetID: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "กรุณากรอกเลขครุภัณฑ์"
            : "เลขครุภัณฑ์ต้องเป็นตัวอักษร",
      })
      .trim()
      .nonempty("เลขครุภัณฑ์ไม่สามารถว่างได้"),
  },
  {
    error: (issue) => {
      if (issue.input === undefined) {
        return "กรุณากรอกข้อมูลเพื่อเพิ่มเลขครุภัณฑ์";
      }
    },
  },
);

export const DeleteAssetRequest = z.object(
  {
    itemID: z.coerce
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "กรุณากรอกไอดีของอุปกรณ์"
            : "เลขอุปกรณ์ต้องเป็นตัวเลข",
      })
      .min(1, "ไอดีของอุปกรณ์ต้องมากกว่า 0")
      .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
      .int("ไอดีของอุปกรณ์ต้องเป็นจำนวนเต็ม"),

    assetID: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "กรุณากรอกเลขครุภัณฑ์"
            : "เลขครุภัณฑ์ต้องเป็นตัวอักษร",
      })
      .trim()
      .nonempty("เลขครุภัณฑ์ไม่สามารถว่างได้"),
  },
  {
    error: (issue) => {
      if (issue.input === undefined) {
        return "กรุณากรอกข้อมูลเพื่อลบเลขครุภัณฑ์";
      }
    },
  },
);

export type CreateAssetRequest = z.infer<typeof CreateAssetRequest>;
export type DeleteAssetRequest = z.infer<typeof DeleteAssetRequest>;
