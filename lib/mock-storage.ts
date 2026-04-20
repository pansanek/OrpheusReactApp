// lib/mock-storage.ts
import { useCallback, useState } from "react";
import {
  musicians as initialMusicians,
  groups as initialGroups,
  venues as initialVenues,
  type Musician,
  type Group,
  type Venue,
} from "./mock-data";

const STORAGE_KEYS = {
  musicians: "umpsm_musicians",
  groups: "umpsm_groups",
  venues: "umpsm_venues",
} as const;

type StorageKey = keyof typeof STORAGE_KEYS;

// 👇 Универсальная функция инициализации
function initializeStorage<T extends { id: number }>(
  key: StorageKey,
  initialData: T[],
  mergeById = true,
): T[] {
  if (typeof window === "undefined") return [...initialData];

  try {
    const saved = localStorage.getItem(STORAGE_KEYS[key]);

    // Если нет сохранённых данных — сохраняем моки и возвращаем их
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(initialData));
      return [...initialData];
    }

    const localData = JSON.parse(saved) as T[];

    // 👇 Merge-логика: добавляем новые моки, но сохраняем изменения пользователя
    if (mergeById) {
      const merged = [...localData];
      const localIds = new Set(merged.map((item) => item.id));

      for (const mock of initialData) {
        if (!localIds.has(mock.id)) {
          merged.push(mock);
        }
      }
      // Сохраняем обновлённый массив
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(merged));
      return merged;
    }

    return localData;
  } catch (e) {
    console.error(`Failed to initialize ${key} from localStorage`, e);
    return [...initialData];
  }
}

// 👇 Функции для каждого типа данных
export function getStoredMusicians(): Musician[] {
  return initializeStorage("musicians", initialMusicians);
}

export function saveMusicians(musicians: Musician[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.musicians, JSON.stringify(musicians));
}

export function getStoredGroups(): Group[] {
  return initializeStorage("groups", initialGroups);
}

export function saveGroups(groups: Group[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groups));
}

export function getStoredVenues(): Venue[] {
  return initializeStorage("venues", initialVenues);
}

export function saveVenues(venues: Venue[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.venues, JSON.stringify(venues));
}

// 👇 Утилита для очистки всех данных (удобно для дев-режима)
export function clearAllMockData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

// 👇 Хук для реактивной работы с данными (опционально)
export function useMockStorage<T extends { id: number }>(
  key: StorageKey,
  initialData: T[],
  mergeById = true,
) {
  const [data, setData] = useState<T[]>(() =>
    initializeStorage(key, initialData, mergeById),
  );

  const updateData = useCallback(
    (updater: (prev: T[]) => T[]) => {
      setData((prev) => {
        const updated = updater(prev);
        // Авто-сохранение при изменении
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(updated));
        }
        return updated;
      });
    },
    [key],
  );

  const resetData = useCallback(() => {
    const reset = [...initialData];
    setData(reset);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(reset));
    }
  }, [key, initialData]);

  return { data, updateData, resetData };
}
