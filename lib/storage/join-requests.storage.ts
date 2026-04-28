import {
  initializeRecordStorage,
  saveRecordToStorage,
  getRecordFromStorage,
} from "./utils";
import { STORAGE_KEYS } from "./keys";

import { joinRequests as mockJoinRequests } from "@/lib/mock-data/join-requests.mock";
import { JoinRequest } from "../types/request.types";

export function getJoinRequests(): Record<string, JoinRequest[]> {
  return initializeRecordStorage("joinRequests", mockJoinRequests);
}

export function saveJoinRequests(
  requests: Record<string, JoinRequest[]>,
): void {
  saveRecordToStorage("joinRequests", requests);
}

export function getJoinRequestsRaw(): Record<string, JoinRequest[]> | null {
  return getRecordFromStorage("joinRequests");
}

export function getJoinRequestsByGroupId(groupId: string): JoinRequest[] {
  const allRequestsRecord = getJoinRequests();

  const allRequests = Object.values(allRequestsRecord).flat();

  return allRequests.filter((request) => request.groupId === groupId);
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
  groupId: string,
  userId: string,
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

export function removeJoinRequest(groupId: string, userId: string): void {
  const all = getJoinRequests();
  const updated = {
    ...all,
    [groupId]: (all[groupId] ?? []).filter((r) => r.userId !== userId),
  };
  saveJoinRequests(updated);
}

export function getPendingRequestsByGroupId(groupId: string): JoinRequest[] {
  return getJoinRequestsByGroupId(groupId).filter(
    (r) => r.status === "pending",
  );
}
