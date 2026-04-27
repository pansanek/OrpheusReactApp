// lib/validations/auth.ts (создайте, если нет)
import { z } from "zod";
import type { Musician, UserRole } from "@/lib/types";

export const musicianRegistrationSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Неверный формат email"),
  phone: z.string().optional(),
  role: z.enum([
    "musician",
    "teacher",
    "producer",
    "sound_engineer",
    "journalist",
  ] as const),
  instruments: z.array(z.string()).min(1, "Укажите хотя бы один инструмент"),
  genres: z.array(z.string()).min(1, "Укажите хотя бы один жанр"),
  skillLevel: z.number().min(1).max(5),
  location: z.string().min(2, "Укажите город"),
  bio: z.string().optional(),
  socialLinks: z
    .object({
      vk: z.string().optional(),
      youtube: z.string().optional(),
      soundcloud: z.string().optional(),
    })
    .optional(),
});

export type MusicianRegistrationInput = z.infer<
  typeof musicianRegistrationSchema
>;
