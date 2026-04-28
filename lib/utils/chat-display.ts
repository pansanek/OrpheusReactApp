// lib/utils/chat-display.ts

import { Chat, ChatType } from "@/lib/types/chat.types";
import { Musician } from "@/lib/types/user.types";
import { Venue } from "@/lib/types/venue.types";

interface GetChatDisplayOptions {
  currentUserId: string;
  musicians?: Musician[]; // lookup по ID
  venues?: Venue[];
  isVenueAdmin?: boolean; // Для VENUE-чатов: является ли текущий пользователь админом учреждения
}

export function getChatDisplayData(
  chat: Chat,
  { currentUserId, musicians, venues, isVenueAdmin }: GetChatDisplayOptions,
) {
  console.log("🔍 DEBUG getChatDisplayData", {
    chatId: chat.id,
    chatType: chat.type,
    participants: chat.participants,
    participantsIsArray: Array.isArray(chat.participants),
    currentUserId,
    musicians,
  });
  switch (chat.type) {
    case ChatType.DIRECT: {
      const otherUserId = chat.participants.find((id) => id !== currentUserId);
      const otherUser = musicians
        ? musicians.find((musician) => musician.id == otherUserId)
        : undefined;
      console.warn("GETDISPLAYDIRECT", otherUser, chat);
      return {
        displayName: otherUser?.name || "Пользователь",
        displayAvatar: otherUser?.avatar ?? null,
        participantUser: otherUser,
        isOnline: otherUser?.status === "online",
      };
    }

    case ChatType.GROUP: {
      console.warn("GETDISPLAYGROUP", chat);
      return {
        displayName: chat.name || "Групповой чат",
        displayAvatar: chat.avatar ?? null,
        membersCount: chat.membersCount,
      };
    }

    case ChatType.VENUE: {
      if (isVenueAdmin) {
        // Админ учреждения видит имя пользователя, с которым общается
        const otherUserId = chat.participants.find(
          (id) => id !== currentUserId,
        );
        const otherUser = musicians
          ? musicians.find((musician) => musician.id == otherUserId)
          : undefined;
        return {
          displayName: otherUser?.name || "Музыкант",
          displayAvatar: otherUser?.avatar ?? null,
          participantUser: otherUser,
        };
      } else {
        // Обычный пользователь видит данные учреждения
        const venue = venues
          ? venues.find((venue) => venue.id == chat.venue)
          : undefined;

        return {
          displayName: venue?.name || chat.name || "Учреждение",
          displayAvatar: venue?.avatar ?? chat.avatar ?? null,
          venueInfo: venue,
        };
      }
    }

    default:
      return {
        displayName: chat.name || "Чат",
        displayAvatar: chat.avatar ?? null,
      };
  }
}
