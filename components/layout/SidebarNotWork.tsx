"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Newspaper,
  Search,
  Users,
  Building2,
  Tags,
  Sparkles,
  User,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/feed", label: "Лента", icon: Newspaper },
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/chat", label: "Чат", icon: MessageCircle },
  { href: "/groups", label: "Группы", icon: Users },
  { href: "/venues", label: "Площадки", icon: Building2 },
  { href: "/ai-tags", label: "ИИ-теги", icon: Tags },
  { href: "/recommendations", label: "Рекомендации", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-border bg-sidebar p-4 lg:block">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick Links */}
      {currentUser && (
        <div className="mt-6 border-t border-sidebar-border pt-4">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Быстрые ссылки
          </h3>
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {currentUser.name.charAt(0)}
            </div>
            Мой профиль
          </Link>
        </div>
      )}

      {/* Genres */}
      <div className="mt-6 border-t border-sidebar-border pt-4">
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Жанры
        </h3>
        <div className="flex flex-wrap gap-1.5 px-3">
          {["Рок", "Джаз", "Поп", "Электроника"].map((genre) => (
            <Link
              key={genre}
              href={`/search?genre=${encodeURIComponent(genre)}`}
              className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem("umpsm_users");
          window.location.reload();
        }}
        className="fixed bottom-4 right-4 px-3 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600"
      >
        Сбросить пользователей
      </button>
    </aside>
  );
}
