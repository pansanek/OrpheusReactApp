import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Название должно быть не менее 3 символов")
    .max(50, "Слишком длинное название"),
  description: z
    .string()
    .max(500, "Максимум 500 символов")
    .optional()
    .or(z.literal("")),
  genre: z.string().min(1, "Обязательно выберите жанр"),
  city: z.string().optional().or(z.literal("")),
  rehearsalSchedule: z.string().optional().or(z.literal("")),
  socialLinks: z
    .object({
      vk: z.string().optional().or(z.literal("")),
      youtube: z.string().optional().or(z.literal("")),
      soundcloud: z.string().optional().or(z.literal("")),
    })
    .optional(),
  openPositions: z.array(z.string()).default([]),
  avatar: z.string().optional().or(z.literal("")),

  invites: z
    .array(
      z.object({
        userId: z.string(),
        position: z.string().min(1, "Выберите позицию для участника"),
      }),
    )
    .default([]),
});

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;
