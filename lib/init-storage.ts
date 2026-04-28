// lib/init-storage.ts
"use client";

import { useEffect } from "react";
import { initializeAllMockData } from "./storage";

export function useInitializeMockData() {
  useEffect(() => {
    // Инициализируем localStorage с моковыми данными при первом запуске
    initializeAllMockData();
  }, []);
}
