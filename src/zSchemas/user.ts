import z from "zod";

export const CreateAssetRequest = z.object({
    id: z
        .number()
        .int()
        .positive(),
    first_name: z
        .string()
        .trim()
        .min(2)
        .max(50),
    last_name : z
        .string()
        .trim()
        .min(2)
        .max(50),
    email: z
        .string()
        .trim()
        .email(),
    role: z
        .string()
        .trim(),
    created_at: z
        .date(),
    deleted_at: z
        .date()
});

export type CreateAssetRequest = z.infer<typeof CreateAssetRequest>;