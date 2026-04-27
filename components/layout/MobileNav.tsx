"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";

import { Button } from "@/components/ui/button";
import {
  Home,
  Newspaper,
  Search,
  Users,
  Building2,
  Tags,
  Sparkles,
  X,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/feed", label: "Лента", icon: Newspaper },
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/groups", label: "Группы", icon: Users },
  { href: "/venues", label: "Площадки", icon: Building2 },
  { href: "/ai-tags", label: "ИИ-теги", icon: Tags },
  { href: "/recommendations", label: "Рекомендации", icon: Sparkles },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-72 bg-card shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="text-lg font-semibold">Меню</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4">
          {/* User Info */}
          {currentUser && (
            <div className="mb-4 rounded-lg bg-muted p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser.instruments.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-1">
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
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          {currentUser && (
            <div className="mt-4 border-t border-border pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>
          )}

          {/* Login Button */}
          {!currentUser && (
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/login">Войти</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
