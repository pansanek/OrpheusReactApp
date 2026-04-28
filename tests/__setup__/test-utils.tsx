// tests/__setup__/test-utils.tsx
import {
  render as baseRender,
  renderHook as baseRenderHook,
  RenderOptions,
  RenderHookOptions,
  queries,
  screen, // ✅ screen содержит все методы: getByRole, getByText, etc.
  waitFor,
  waitForElementToBeRemoved,
  fireEvent,
  within,
  queryByRole,
  queryByText,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import React from "react";

// 🔹 Обёртка со всеми провайдерами
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}

// 🔹 Кастомный render для компонентов
export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return baseRender(ui, { wrapper: AllTheProviders, ...options });
}

// 🔹 Кастомный renderHook для хуков и контекстов
export function renderHook<Result, Props>(
  hook: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props>,
) {
  return baseRenderHook(hook, {
    wrapper: AllTheProviders,
    ...options,
  });
}

// 🔹 Экспортируем остальные утилиты из RTL (кроме render/renderHook)
export {
  screen, // ✅ screen.getByRole, screen.getByText, etc.
  waitFor,
  waitForElementToBeRemoved,
  fireEvent,
  within,
  queryByRole, // ✅ это существует как отдельный экспорт
  queryByText,
  act,
} from "@testing-library/react";

// 🔹 Экспортируем типы и утилиты
export type { RenderResult, RenderHookResult } from "@testing-library/react";
export { queries };
