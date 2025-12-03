import z, { infer } from "zod";

export const Item = z.object({
  id: z.number(),
  name: z.string().trim(),
  description: z.string().trim().optional(),
  image_url: z.string().trim().optional(),
});

export type Item = z.infer<typeof Item>;
