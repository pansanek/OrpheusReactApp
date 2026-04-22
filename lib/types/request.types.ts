export interface JoinRequest {
  userId: number;
  groupId: number;
  position: string;
  message: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface SentInvite {
  id: number;
  fromUserId: number;
  toUserId: number;
  groupId: number | null;
  groupName?: string;
  position: string;
  message: string;
  createdAt: string;
  status: "sent" | "accepted" | "declined";
}
