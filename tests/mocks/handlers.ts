// tests/mocks/handlers.ts — исправленная версия
import { http, HttpResponse, HttpRequestResolverExtras } from "msw";

// Тип для тела запроса авторизации
interface LoginBody {
  email: string;
  password: string;
}

export const handlers = [
  // ✅ Явно указываем тип тела запроса
  http.post<never, LoginBody>("/api/auth/login", async ({ request }) => {
    const body = await request.json();

    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json(
        {
          user: { id: "1", email: body.email, name: "Test User" },
          token: "mock-jwt-token",
        },
        { status: 200 },
      );
    }
    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  // Для GET-запросов без тела — всё как было
  http.get("/api/musicians", () => {
    return HttpResponse.json({
      data: [
        { id: "1", name: "Иван Иванов", genre: "Rock", rating: 4.8 },
        { id: "2", name: "Мария Петрова", genre: "Jazz", rating: 4.9 },
      ],
      total: 2,
    });
  }),
];
