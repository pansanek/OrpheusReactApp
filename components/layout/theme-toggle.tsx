// components/layout/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { COLOR_SCHEMES } from "@/lib/theme-config";
import { cn } from "@/lib/utils/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [colorScheme, setColorScheme] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("color-scheme") || "orchid";
    }
    return "orchid";
  });

  const handleColorSchemeChange = (schemeId: string) => {
    setColorScheme(schemeId);
    if (typeof window !== "undefined") {
      (window as any).applyColorScheme?.(schemeId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Переключить тему</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Режим отображения</DropdownMenuLabel>

        {/* Переключение светлая/тёмная/система */}
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <Sun className="h-4 w-4" />
          <span>Светлая</span>
          {theme === "light" && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <Moon className="h-4 w-4" />
          <span>Тёмная</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <Monitor className="h-4 w-4" />
          <span>Как в системе</span>
          {theme === "system" && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Выбор цветовой схемы */}
        <DropdownMenuLabel className="flex items-center gap-1">
          <Palette className="h-3 w-3" />
          Цветовая схема
        </DropdownMenuLabel>

        {COLOR_SCHEMES.map((scheme) => (
          <DropdownMenuItem
            key={scheme.id}
            onClick={() => handleColorSchemeChange(scheme.id)}
            className={cn(
              "flex items-center gap-3 py-2.5",
              colorScheme === scheme.id && "bg-accent",
            )}
          >
            {/* Превью цветов */}
            <div className="flex gap-0.5">
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: scheme.colors.primary }}
              />
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: scheme.colors.secondary }}
              />
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: scheme.colors.accent }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{scheme.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {scheme.description}
              </div>
            </div>

            {colorScheme === scheme.id && (
              <span className="text-xs text-primary font-medium">Активна</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
