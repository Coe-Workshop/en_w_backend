import z from "zod";

export const CreateAssetRequest = z.object({
  assets_id: z
    .string("ต้องการเลขครุภัณฑ์")
    .trim()
    .nonempty("กรุณากรอกเลขครุภัณฑ์"),
  item_id: z.coerce
    .number({ message: "ไอดีต้องเป็นตัวเลข" })
    .min(1, "ไอดีของอุปกรณ์ต้องมากกว่า 0")
    .max(2147483647, "ไม่พบอุปกรณ์ดังกล่าว")
    .int("ไอดีของอุปกรณ์เป็นจำนวนเต็ม"),
});

export type CreateAssetRequest = z.infer<typeof CreateAssetRequest>;
