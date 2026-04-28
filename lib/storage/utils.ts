import { STORAGE_KEYS, type StorageKey } from "./keys";

export function initializeStorage<T extends { id: number | string }>(
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

    // Merge-логика: добавляем новые моки, но сохраняем изменения пользователя
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

export function saveToStorage<T>(key: StorageKey, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
}
export function getFromStorage<T>(key: StorageKey): T[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Инициализация данных типа Record<K, T[]>
 * mergeByKey: если true — добавляет новые ключи из моков, не перезаписывая существующие
 */
export function initializeRecordStorage<K extends string | number, T>(
  key: StorageKey,
  initialData: Record<K, T[]>,
  mergeByKey = true,
): Record<K, T[]> {
  if (typeof window === "undefined") return { ...initialData };

  try {
    const saved = localStorage.getItem(STORAGE_KEYS[key]);

    if (!saved) {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(initialData));
      return { ...initialData };
    }

    const localData = JSON.parse(saved) as Record<K, T[]>;

    if (mergeByKey) {
      const merged = { ...localData };
      const localKeys = new Set(Object.keys(merged));

      // 👇 FIX: Явно приводим тип entries к [K, T[]][]
      for (const [mockKey, mockItems] of Object.entries(initialData) as Array<
        [K, T[]]
      >) {
        // 👇 FIX: Object.keys всегда возвращает string, поэтому сравниваем через String()
        if (!localKeys.has(String(mockKey))) {
          merged[mockKey] = mockItems;
        }
      }
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(merged));
      return merged;
    }

    return localData;
  } catch (e) {
    console.error(`Failed to initialize ${key} from localStorage`, e);
    return { ...initialData };
  }
}

/** Сохранение данных типа Record<K, T[]> */
export function saveRecordToStorage<K extends string | number, T>(
  key: StorageKey,
  data: Record<K, T[]>,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
}

/** Получение данных типа Record<K, T[]> без инициализации */
export function getRecordFromStorage<K extends string | number, T>(
  key: StorageKey,
): Record<K, T[]> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    return raw ? (JSON.parse(raw) as Record<K, T[]>) : null;
  } catch {
    return null;
  }
}
