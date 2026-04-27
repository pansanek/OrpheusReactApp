import { SentInvite } from "../types/request.types";

export const sentInvites: Record<number, SentInvite[]> = {
  1: [
    {
      id: "201",
      fromUserId: "1",
      toUserId: "5",
      groupId: "1",
      groupName: "Echoes",
      position: "Бас-гитара",
      message: "Привет! Ищем басиста в нашу группу",
      createdAt: "2024-03-08T10:00:00Z",
      status: "sent",
    },
  ],
  2: [
    {
      id: "202",
      fromUserId: "2",
      toUserId: "1",
      groupId: "2",
      groupName: "Jazz Collective",
      position: "Пианист",
      message: "Привет! Хочешь присоединиться к нашим джем-сессиям?",
      createdAt: "2024-03-10T15:00:00Z",
      status: "sent",
    },
  ],
};
