import {
  initializeRecordStorage,
  saveRecordToStorage,
  getRecordFromStorage,
} from "./utils";
import { STORAGE_KEYS } from "./keys";

import { joinRequests as mockJoinRequests } from "@/lib/mock-data/join-requests.mock";
import { JoinRequest } from "../types/request.types";

export function getJoinRequests(): Record<number, JoinRequest[]> {
  return initializeRecordStorage("joinRequests", mockJoinRequests);
}

export function saveJoinRequests(
  requests: Record<number, JoinRequest[]>,
): void {
  saveRecordToStorage("joinRequests", requests);
}

export function getJoinRequestsRaw(): Record<number, JoinRequest[]> | null {
  return getRecordFromStorage("joinRequests");
}

export function getJoinRequestsByGroupId(groupId: number): JoinRequest[] {
  return getJoinRequests()[groupId] ?? [];
}

export function addJoinRequest(request: JoinRequest): void {
  const all = getJoinRequests();
  const updated = {
    ...all,
    [request.groupId]: [...(all[request.groupId] ?? []), request],
  };
  saveJoinRequests(updated);
}

export function updateJoinRequestStatus(
  groupId: number,
  userId: number,
  status: "pending" | "approved" | "rejected",
): void {
  const all = getJoinRequests();
  const updated = {
    ...all,
    [groupId]: (all[groupId] ?? []).map((r) =>
      r.userId === userId ? { ...r, status } : r,
    ),
  };
  saveJoinRequests(updated);
}

export function removeJoinRequest(groupId: number, userId: number): void {
  const all = getJoinRequests();
  const updated = {
    ...all,
    [groupId]: (all[groupId] ?? []).filter((r) => r.userId !== userId),
  };
  saveJoinRequests(updated);
}

export function getPendingRequestsByGroupId(groupId: number): JoinRequest[] {
  return getJoinRequestsByGroupId(groupId).filter(
    (r) => r.status === "pending",
  );
}
