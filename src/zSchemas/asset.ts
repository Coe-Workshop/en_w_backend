import z from "zod";

export const CreateAssetRequest = z.object({
  assets_id: z
    .string("ต้องการเลขครุภัณฑ์")
    .trim()
    .nonempty("กรุณากรอกเลขครุภัณฑ์"),
});

// export const DeleteAssetRequest = z.object({
//   assets_id: z
//     .string("ไม่พบเลขครุภัณฑ์ที่ระบุ")
//     .trim()
//     .nonempty("ต้องการเลขครุภัณฑ์"),
// });

export const DeleteAssetRequest = z
  .string("ไม่พบเลขครุภัณฑ์ที่ระบุ")
  .trim()
  .nonempty("ต้องการเลขครุภัณฑ์");

// export const DeleteAssetParamSche = z.object({
//   assetId: z
//     .string()
//     .trim()
//     .min(1, "ต้องการเลขครุภัณฑ์"),
// });

export type CreateAssetRequest = z.infer<typeof CreateAssetRequest>;
export type DeleteAssetRequest = z.infer<typeof DeleteAssetRequest>;
