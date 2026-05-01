"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn, normalizeImagePath } from "@/lib/utils/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Search,
  Users,
  Newspaper,
  MapPin,
  Sparkles,
  Star,
  X,
  MessageCircle,
  CalendarDays,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getApprovedRequestsByMusicianId,
  getGroupsByMusicianId,
  getModerationReports,
  getVenueByAdminId,
} from "@/lib/storage";
import { SidebarNavItem } from "./sidebarNavItem";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { BookingCalendarDialog } from "./booking-calendar-dialog";
import { ThemeToggle } from "./layout/theme-toggle";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: "/feed", label: "Лента", icon: Newspaper },
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/chat", label: "Чат", icon: MessageCircle },
  { href: "/groups", label: "Группы", icon: Users },
  { href: "/venues", label: "Учреждения", icon: MapPin },
  { href: "/ai-tags", label: "Теги ИИ", icon: Sparkles },
  { href: "/recommendations", label: "Рекомендации", icon: Star },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, groupsState } = useAuth();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  // useEffect для подсчёта (после существующего useEffect с upcomingCount):
  useEffect(() => {
    if (currentUser?.role === "moderator" || currentUser?.role === "admin") {
      const reports = getModerationReports(); // импортируйте из moderation.storage
      const pending = reports.filter((r) => r.status === "pending").length;
      setPendingReportsCount(pending);
    }
  }, [currentUser]);
  // Обновляем счётчик при монтировании и при изменениях в localStorage
  useEffect(() => {
    const updateCount = () => {
      if (currentUser) {
        setUpcomingCount(
          getApprovedRequestsByMusicianId(currentUser.id, true).length,
        );
      }
    };
    updateCount();
    window.addEventListener("storage", updateCount); // Синхронизация между вкладками
    return () => window.removeEventListener("storage", updateCount);
  }, [currentUser]);

  const userGroups = currentUser
    ? getGroupsByMusicianId(currentUser.id, groupsState)
    : [];

  //  Получаем учреждение, если пользователь — админ
  const adminVenue = currentUser
    ? getVenueByAdminId(currentUser.id)
    : undefined;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-0 h-screen lg:h-[calc(100vh-4rem)] w-[280px] bg-sidebar border-r border-sidebar-border p-4 overflow-y-auto transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Mobile close button */}
        <div className="flex justify-end lg:hidden mb-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User profile shortcut */}
        <Link
          href="/profile"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors mb-4"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={currentUser.avatar ?? undefined}
              alt={currentUser.name}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sidebar-foreground truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.instruments.join(", ")}
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1 mb-6">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent",
            )}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Главная</span>
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          {(currentUser.role === "moderator" ||
            currentUser.role === "admin") && (
            <Link
              href="/moderation"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                pathname === "/moderation"
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Shield className="h-5 w-5" />
              <span className="font-medium">Модерация</span>
              {/* Опционально: бейдж с количеством новых репортов */}
              <Badge
                variant="destructive"
                className="ml-auto h-5 min-w-5 p-0 text-[10px]"
              >
                {pendingReportsCount}
              </Badge>
            </Link>
          )}
        </nav>

        {/* Divider */}
        <div className="border-t border-sidebar-border my-4" />

        {adminVenue && (
          <div className="mb-4">
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Моё учреждение
            </h3>
            <SidebarNavItem
              href={`/venues/${adminVenue.id}`}
              name={adminVenue.name}
              avatar={adminVenue.avatar}
              isActive={pathname === `/venues/${adminVenue.id}`}
              badge="Админ"
              badgeColor="admin"
            />
          </div>
        )}

        {/* 👇 Секция "Мои группы" (только если есть) */}
        {userGroups.length > 0 && (
          <div className={adminVenue ? "mb-4" : ""}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {adminVenue ? "Группы" : "Мои группы"}
            </h3>
            <div className="space-y-1">
              {userGroups.map((group) => (
                <SidebarNavItem
                  key={group.id}
                  href={`/groups/${group.id}`}
                  name={group.name}
                  avatar={group.avatar}
                  isActive={pathname === `/groups/${group.id}`}
                  badge={
                    group.creatorId === currentUser.id ? "Админ" : undefined
                  }
                  badgeColor={
                    group.creatorId === currentUser.id ? "admin" : "member"
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* 👇 Пустое состояние — только если нет НИ групп, НИ учреждения */}
        {userGroups.length === 0 && !adminVenue && (
          <div className="px-3 py-2">
            <p className="text-sm text-muted-foreground">
              Вы ещё не состоите в группах
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Создайте группу или присоединитесь к существующей
            </p>
          </div>
        )}

        <button
          onClick={() => setCalendarOpen(true)}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <CalendarDays className="h-5 w-5" />
          <span className="font-medium flex-1 text-left">Расписание</span>
          {upcomingCount > 0 && (
            <Badge className="h-5 min-w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
              {upcomingCount}
            </Badge>
          )}
        </button>
      </aside>
      {/* <div className="flex items-center gap-2">
        <ThemeToggle />
      </div> */}
      <BookingCalendarDialog
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
      />
    </>
  );
}
