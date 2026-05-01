// lib/theme-config.ts
export type ThemeMode = "light" | "dark" | "system";

export type ColorScheme = {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string; // hex для превью
    secondary: string;
    accent: string;
    background: string;
  };
  cssVariables: Record<string, string>;
};

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "orchid",
    name: "Orchid",
    description: "Фиолетовая гамма для креативных музыкантов",
    colors: {
      primary: "#8b5cf6",
      secondary: "#a78bfa",
      accent: "#c4b5fd",
      background: "#fafafa",
    },
    cssVariables: {
      "--primary": "262 83% 58%",
      "--primary-foreground": "210 40% 98%",
      "--secondary": "262 80% 70%",
      "--accent": "262 70% 85%",
      // ... остальные переменные shadcn/ui
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Тёмная синяя тема для ночных сессий",
    colors: {
      primary: "#3b82f6",
      secondary: "#60a5fa",
      accent: "#93c5fd",
      background: "#0f172a",
    },
    cssVariables: {
      "--primary": "217 91% 60%",
      "--primary-foreground": "210 40% 98%",
      "--secondary": "217 90% 70%",
      "--accent": "217 85% 80%",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Тёплая оранжевая палитра",
    colors: {
      primary: "#f97316",
      secondary: "#fb923c",
      accent: "#fdba74",
      background: "#fff7ed",
    },
    cssVariables: {
      "--primary": "24 95% 53%",
      "--primary-foreground": "0 0% 98%",
      "--secondary": "24 95% 65%",
      "--accent": "24 90% 75%",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Природная зелёная тема",
    colors: {
      primary: "#22c55e",
      secondary: "#4ade80",
      accent: "#86efac",
      background: "#f0fdf4",
    },
    cssVariables: {
      "--primary": "142 71% 45%",
      "--primary-foreground": "0 0% 98%",
      "--secondary": "142 70% 60%",
      "--accent": "142 65% 75%",
    },
  },
];

export const DEFAULT_SCHEME = "orchid";
export const DEFAULT_MODE: ThemeMode = "system";
