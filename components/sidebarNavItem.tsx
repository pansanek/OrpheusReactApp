// components/sidebar-nav-item.tsx
"use client";

import Link from "next/link";
import { cn, normalizeImagePath } from "@/lib/utils/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarNavItemProps {
  href: string;
  name: string;
  avatar?: string | null;
  isActive: boolean;
  badge?: string;
  badgeColor?: "default" | "admin" | "member";
}

export function SidebarNavItem({
  href,
  name,
  avatar,
  isActive,
  badge,
  badgeColor = "default",
}: SidebarNavItemProps) {
  const getInitials = (str: string) =>
    str
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const badgeStyles = {
    default: "bg-muted text-muted-foreground",
    admin: "bg-primary/10 text-primary font-medium",
    member: "bg-secondary/50 text-secondary-foreground",
  };

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent",
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage
          src={normalizeImagePath(avatar) ?? undefined}
          alt={name}
          className="transition-opacity group-hover:opacity-90"
        />
        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <span className="text-sm font-medium truncate flex-1">{name}</span>

      {badge && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-md shrink-0",
            badgeStyles[badgeColor],
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
