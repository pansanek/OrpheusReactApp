// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Palette, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { COLOR_SCHEMES, type ThemeMode } from "@/lib/theme-config";
import { cn } from "@/lib/utils/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [colorScheme, setColorScheme] = useState<string>("orchid");

  useEffect(() => {
    const saved = localStorage.getItem("color-scheme");
    if (saved) setColorScheme(saved);
  }, []);

  const handleColorSchemeChange = (schemeId: string) => {
    setColorScheme(schemeId);
    localStorage.setItem("color-scheme", schemeId);
    (window as any).applyColorScheme?.(schemeId);
  };

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">
          Настройте внешний вид приложения под себя
        </p>
      </div>

      <Separator />

      {/* Секция: Режим темы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Тема интерфейса
          </CardTitle>
          <CardDescription>
            Выберите предпочтительный режим отображения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", label: "Светлая", icon: Sun },
              { id: "dark", label: "Тёмная", icon: Moon },
              { id: "system", label: "Системная", icon: Monitor },
            ].map((mode) => (
              <Button
                key={mode.id}
                variant={theme === mode.id ? "default" : "outline"}
                className={cn(
                  "h-auto flex-col gap-2 py-4",
                  theme === mode.id && "border-primary",
                )}
                onClick={() => setTheme(mode.id as ThemeMode)}
              >
                <mode.icon className="h-5 w-5" />
                <span>{mode.label}</span>
                {theme === mode.id && (
                  <Check className="h-4 w-4 text-primary-foreground absolute top-2 right-2" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Секция: Цветовые схемы */}
      <Card>
        <CardHeader>
          <CardTitle>Цветовая схема</CardTitle>
          <CardDescription>
            Выберите акцентные цвета для интерфейса
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {COLOR_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => handleColorSchemeChange(scheme.id)}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-lg border p-4 text-left transition-all",
                  "hover:border-primary/50 hover:shadow-sm",
                  colorScheme === scheme.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border",
                )}
              >
                {/* Индикатор выбора */}
                {colorScheme === scheme.id && (
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {/* Превью палитры */}
                <div className="flex gap-1.5">
                  {Object.values(scheme.colors).map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border border-border shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Информация */}
                <div>
                  <div className="font-medium">{scheme.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {scheme.description}
                  </div>
                </div>

                {/* Пример кнопки в этой схеме */}
                <div className="pt-2">
                  <div
                    className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: scheme.colors.primary }}
                  >
                    Пример кнопки
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
