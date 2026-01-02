import z from "zod";

export const CreateAssetRequest = z.object(
  {
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
