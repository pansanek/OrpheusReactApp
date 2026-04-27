// lib/utils/chat-enricher.ts

import { Chat, ChatType, ChatWithDisplay } from "@/lib/types/chat.types";
import { Musician } from "@/lib/types/user.types";
import { Venue } from "@/lib/types/venue.types";

interface EnrichChatOptions {
  currentUserId: string;
  musicians: Musician[];
  venues: Venue[];
  venueAdminOf?: string[]; // ID учреждений, где пользователь — админ
}

/**
 * Вычисляет отображаемые данные для чата на основе его типа и контекста
 */
export function enrichChatWithDisplay(
  chat: Chat,
  { currentUserId, musicians, venues, venueAdminOf = [] }: EnrichChatOptions,
): ChatWithDisplay {
  console.log("🔍 DEBUG enrichChatWithDisplay", {
    chatId: chat.id,
    chatType: chat.type,
    participants: chat.participants,
    participantsIsArray: Array.isArray(chat.participants),
    currentUserId,
    musicians,
  });
  const base = { ...chat }; // Копируем исходные данные

  switch (chat.type) {
    case ChatType.DIRECT: {
      const otherUserId = chat.participants.find((id) => id !== currentUserId);
      console.log("otherUserId", otherUserId);
      const otherUser = musicians
        ? musicians.find((musician) => musician.id == otherUserId)
        : undefined;
      console.log("otherUser", otherUser);
      return {
        ...base,
        displayName: otherUser?.name || "Пользователь",
        displayAvatar: otherUser?.avatar ?? null,
        participantUser: otherUser,
        isOnline: otherUser?.status === "online",
      };
    }

    case ChatType.GROUP: {
      return {
        ...base,
        displayName: chat.name || "Групповой чат",
        displayAvatar: chat.avatar ?? null,
        membersCount: chat.membersCount,
      };
    }

    case ChatType.VENUE: {
      const isVenueAdmin = chat.venue && venueAdminOf.includes(chat.venue);

      if (isVenueAdmin) {
        // Админ учреждения видит собеседника-музыканта
        const otherUserId = chat.participants.find(
          (id) => id !== currentUserId,
        );
        const otherUser = musicians
          ? musicians.find((musician) => musician.id == otherUserId)
          : undefined;

        return {
          ...base,
          displayName: otherUser?.name || "Музыкант",
          displayAvatar: otherUser?.avatar ?? null,
          participantUser: otherUser,
        };
      } else {
        // Музыкант видит данные учреждения
        const venue = venues
          ? venues.find((venue) => venue.id == chat.venue)
          : undefined;
        return {
          ...base,
          displayName: venue?.name || chat.name || "Учреждение",
          displayAvatar: venue?.avatar ?? chat.avatar ?? null,
          venueInfo: venue,
        };
      }
    }

    default:
      return {
        ...base,
        displayName: chat.name || "Чат",
        displayAvatar: chat.avatar ?? null,
      };
  }
}
