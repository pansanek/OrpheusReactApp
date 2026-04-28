// tests/unit/hooks/useAuth.test.tsx
import { useAuth } from "@/contexts/auth-context";
import { renderHook, act, screen } from "@/tests/__setup__/test-utils";

import { vi, describe, beforeEach, it, expect } from "vitest";

// Мокируем store и API
vi.mock("@/store/store", () => ({
  store: {
    dispatch: vi.fn(),
    getState: vi.fn(() => ({ auth: { user: null, token: null } })),
    subscribe: vi.fn(),
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("возвращает initial state при отсутствии пользователя", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.currentUser).toBeNull();
  });
});
