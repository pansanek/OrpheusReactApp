import { initializeStorage, saveToStorage, getFromStorage } from "./utils";
import { STORAGE_KEYS } from "./keys";
import type { Musician } from "@/lib/types";
import { musicians as mockMusicians } from "@/lib/mock-data/musicians.mock";

// 👇 Инициализация + чтение
export function getMusicians(): Musician[] {
  return initializeStorage("musicians", mockMusicians);
}

// 👇 Сохранение
export function saveMusicians(musicians: Musician[]): void {
  saveToStorage("musicians", musicians);
}

//  Поиск по фильтрам (работает с localStorage данными)
export function searchMusicians(filters: {
  instrument?: string;
  genre?: string;
  location?: string;
  minSkillLevel?: number;
  role?: string;
}): Musician[] {
  const musicians = getMusicians();

  return musicians.filter((m) => {
    if (filters.role && m.role !== filters.role) return false;
    if (filters.instrument && !m.instruments.includes(filters.instrument))
      return false;
    if (filters.genre && !m.genres.includes(filters.genre)) return false;
    if (
      filters.location &&
      !m.location.toLowerCase().includes(filters.location.toLowerCase())
    )
      return false;
    if (filters.minSkillLevel && m.skillLevel < filters.minSkillLevel)
      return false;
    return true;
  });
}

// 👇 Вспомогательные функции
export function getMusicianById(id: string): Musician | undefined {
  return getMusicians().find((m) => m.id === id);
}

export function getGroupsByMusicianId(
  musicianId: string,
  groups: import("@/lib/types").Group[],
): import("@/lib/types").Group[] {
  return groups.filter((g) => g.members.includes(musicianId));
}

export function getPostsByAuthorId(
  authorId: string,
  posts: import("@/lib/types").Post[],
): import("@/lib/types").Post[] {
  return posts.filter((p) => p.authorId === authorId);
}

// Рекомендации (алгоритм остаётся тем же)
export function getRecommendations(
  currentUserId: string,
): { musician: Musician; score: number }[] {
  const currentUser = getMusicianById(currentUserId);
  if (!currentUser) return [];

  return getMusicians()
    .filter((m) => m.id !== currentUserId)
    .map((m) => {
      let score = 0;
      const genreMatch = m.genres.filter((g) =>
        currentUser.genres.includes(g),
      ).length;
      score += genreMatch * 0.2;
      if (m.location === currentUser.location) score += 0.3;
      const userTagTexts = currentUser.aiTags.map((t) => t.text.toLowerCase());
      const matchingTags = m.aiTags.filter((t) =>
        userTagTexts.some(
          (ut) =>
            t.text.toLowerCase().includes(ut) ||
            ut.includes(t.text.toLowerCase()),
        ),
      ).length;
      score += matchingTags * 0.25;
      return { musician: m, score: Math.min(score, 1) };
    })
    .sort((a, b) => b.score - a.score);
}
