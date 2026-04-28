export type NotificationType =
  | "group_invite"
  | "booking_request"
  | "group_join_request"
  | "message";

export interface BaseNotification {
  id: string;
  type: NotificationType;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  createdAt: string;
  read: boolean;
}

export interface GroupInviteNotification extends BaseNotification {
  type: "group_invite";
  groupId: string;
  groupName: string;
  position: string;
  message: string;
}

export interface BookingRequestNotification extends BaseNotification {
  type: "booking_request";
  venueId: string;
  venueName: string;
  date: string;
  time: string;
  hours: number;
  totalPrice: number;
  message?: string;
}

export interface GroupJoinRequestNotification extends BaseNotification {
  type: "group_join_request";
  fromUserAvatar?: string;
  groupId: string;
  groupName: string;
  position: string;
  message: string;
}

export interface MessageNotification extends BaseNotification {
  type: "message";
  chatId: string;
  chatName?: string;
  lastMessage: string;
}

export type AppNotification =
  | GroupInviteNotification
  | BookingRequestNotification
  | GroupJoinRequestNotification
  | MessageNotification;
