import { SentInvite } from "../types/request.types";
import { initializeRecordStorage, saveRecordToStorage } from "./utils";
import { sentInvites as mockSentInvites } from "@/lib/mock-data/sent-invites.mock";

// 👈 Приглашения: Record<fromUserId, SentInvite[]>
export function getSentInvites(): Record<number, SentInvite[]> {
  return initializeRecordStorage("sentInvites", mockSentInvites);
}

export function saveSentInvites(invites: Record<number, SentInvite[]>): void {
  saveRecordToStorage("sentInvites", invites);
}

export function getSentInvitesByUserId(userId: number): SentInvite[] {
  return getSentInvites()[userId] ?? [];
}

export function addSentInvite(invite: SentInvite): void {
  const all = getSentInvites();
  const updated = {
    ...all,
    [invite.fromUserId]: [...(all[invite.fromUserId] ?? []), invite],
  };
  saveSentInvites(updated);
}

export function updateSentInviteStatus(
  fromUserId: number,
  inviteId: number,
  status: "accepted" | "declined",
): void {
  const all = getSentInvites();
  const updated = {
    ...all,
    [fromUserId]: (all[fromUserId] ?? []).map((i) =>
      i.id === inviteId ? { ...i, status } : i,
    ),
  };
  saveSentInvites(updated);
}
