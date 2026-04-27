export interface JoinRequest {
  id: string;
  userId: string;
  groupId: string;
  position: string;
  message: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface SentInvite {
  id: string;
  fromUserId: string;
  toUserId: string;
  groupId: string;
  groupName?: string;
  position: string;
  message: string;
  createdAt: string;
  status: "sent" | "accepted" | "declined";
}
