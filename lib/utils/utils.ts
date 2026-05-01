import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeImagePath(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (path?.length > 1_000_000) {
    console.warn(
      "Avatar слишком большой:",
      (path.length / 1024 / 1024).toFixed(2),
      "MB",
    );
  }
  if (
    path.startsWith("http") ||
    path.startsWith("data:") ||
    path.startsWith("/") ||
    path.startsWith("blob")
  ) {
    return path;
  }

  // Относительные пути из моков добавляем в public/
  return `/${path}`;
}
