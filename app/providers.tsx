"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { COLOR_SCHEMES, DEFAULT_SCHEME } from "@/lib/theme-config";
interface ProvidersProps {
  children: ReactNode;
}
export function useColorScheme() {
  const [schemeId, setSchemeId] = useState<string>(DEFAULT_SCHEME);

  useEffect(() => {
    // Читаем из localStorage только на клиенте
    const saved = localStorage.getItem("color-scheme");
    if (saved && COLOR_SCHEMES.some((s) => s.id === saved)) {
      setSchemeId(saved);
      applyColorScheme(saved);
    } else {
      applyColorScheme(DEFAULT_SCHEME);
    }
  }, []);

  const applyColorScheme = (id: string) => {
    // Guard: выполняем только в браузере
    if (typeof window === "undefined") return;

    const scheme = COLOR_SCHEMES.find((s) => s.id === id);
    if (!scheme) return;

    // Применяем CSS-переменные
    Object.entries(scheme.cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    localStorage.setItem("color-scheme", id);
    document.documentElement.setAttribute("data-color-scheme", id);
  };

  const changeScheme = (id: string) => {
    setSchemeId(id);
    applyColorScheme(id);
  };

  return { schemeId, changeScheme };
}
export function Providers({ children }: ProvidersProps) {
  // useColorScheme();
  return <Provider store={store}>{children} </Provider>;
}
