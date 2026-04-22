"use client";

import { initializeAllMockData } from "@/lib/storage";
import { useEffect } from "react";

export function StorageInitializer() {
  useEffect(() => {
    initializeAllMockData();
  }, []);

  return null;
}
