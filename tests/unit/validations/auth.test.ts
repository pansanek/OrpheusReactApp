// tests/unit/validations/auth.test.ts
import { musicianRegistrationSchema } from "@/lib/validations/auth";
import { describe, it, expect } from "vitest";

describe("musicianRegistrationSchema", () => {
  it("принимает валидные данные", () => {
    const data = {
      name: "Иван",
      email: "ivan@test.com",
      location: "Москва",
      instruments: ["guitar"],
      genres: ["rock"],
      skillLevel: 3,
      role: "musician" as const,
      bio: "",
      socialLinks: {},
    };

    const result = musicianRegistrationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("требует обязательные поля", () => {
    const result = musicianRegistrationSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.errors.map((e) => e.path[0])).toEqual(
      expect.arrayContaining(["name", "email", "location"]),
    );
  });
});
