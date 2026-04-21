import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeImagePath(
  path: string | null | undefined,
): string | undefined {
  console.log(path);
  if (!path) return undefined;

  if (
    path.startsWith("http") ||
    path.startsWith("data:") ||
    path.startsWith("/")
  ) {
    return path;
  }

  // Относительные пути из моков добавляем в public/
  return `/${path}`;
}
