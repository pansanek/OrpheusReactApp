import { AppNotification } from "../types/notification.types";

export const notifications: Record<number, AppNotification[]> = {
  1: [
    {
      id: "101",
      type: "group_invite",
      fromUserId: "2",
      fromUserName: "Мария Сидорова",
      groupId: "2",
      toUserId: "1",
      groupName: "Jazz Collective",
      position: "Пианист",
      message: "Привет! Хочешь присоединиться к нашим джем-сессиям?",
      createdAt: "2024-03-10T15:00:00Z",
      read: false,
    },
  ],
  2: [
    {
      id: "102",
      type: "booking_request",
      fromUserId: "5",
      fromUserName: "Иван Новиков",
      venueId: "1",
      toUserId: "3",
      venueName: 'Студия "Звук"',
      date: "2024-03-20",
      time: "18:00",
      hours: 3,
      totalPrice: 7500,
      message: "Хотим записать демо-трек",
      createdAt: "2024-03-12T10:00:00Z",
      read: true,
    },
  ],
  3: [
    {
      id: "103",
      type: "group_join_request",
      fromUserId: "4",
      fromUserName: "Анна Волкова",
      fromUserAvatar: "musician-4.png",
      groupId: "2",
      groupName: "Jazz Collective",
      position: "Скрипка",
      message: "Мне очень интересен ваш проект!",
      createdAt: "2024-03-11T14:00:00Z",
      read: false,
      toUserId: "2",
    },
  ],
};
