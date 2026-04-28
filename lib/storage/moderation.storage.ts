import { initializeStorage, saveToStorage, getFromStorage } from "./utils";
import { STORAGE_KEYS } from "./keys";
import { MOCK_REPORTS } from "@/lib/mock-data/moderation.mock";
import { ModerationReport } from "@/lib/types/moderation.types";

export function getModerationReports(): ModerationReport[] {
  return initializeStorage("reports", MOCK_REPORTS);
}

export function clearReportsStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.reports);
}

export function saveModerationReports(reports: ModerationReport[]): void {
  saveToStorage("reports", reports);
}

export function getModerationReportsRaw(): ModerationReport[] | null {
  return getFromStorage("reports");
}

export function getModerationReportById(
  id: string,
): ModerationReport | undefined {
  return getModerationReports().find((r) => r.id === id);
}

export function addModerationReport(
  reportData: Omit<ModerationReport, "id" | "timestamp" | "status">,
): void {
  const reports = getModerationReports();
  const newReport: ModerationReport = {
    ...reportData,
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    status: "pending",
  };
  saveModerationReports([newReport, ...reports]);
}

export function updateModerationReport(
  id: string,
  updates: Partial<ModerationReport>,
): void {
  const reports = getModerationReports();
  const index = reports.findIndex((r) => r.id === id);

  if (index !== -1) {
    reports[index] = {
      ...reports[index],
      ...updates,
      reviewedAt:
        updates.status && updates.status !== "pending"
          ? Date.now()
          : reports[index].reviewedAt,
    };
    saveModerationReports(reports);
  }
}

export function removeModerationReport(id: string): void {
  const reports = getModerationReports();
  saveModerationReports(reports.filter((r) => r.id !== id));
}
