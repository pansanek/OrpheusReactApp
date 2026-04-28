// src/features/chat/utils/getChatDisplayInfo.ts

import { musicians } from "@/lib/mock-data";
import { Chat, ChatType } from "@/lib/types/chat.types";

/**
 * Возвращает данные для отображения чата в списке
 * Для DIRECT-чатов — возвращает данные второго участника (не текущего пользователя)
 * Для GROUP/VENUE — возвращает данные самого чата
 */
export const getChatDisplayInfo = (
  chat: Chat,
  currentUserId: string | undefined,
) => {
  console.warn(chat);
  console.warn(currentUserId);
  if (chat.type !== ChatType.DIRECT) {
    return {
      displayName: chat.name,
      displayAvatar: chat.avatar,
      participantId: null,
    };
  }

  const otherParticipantId = chat.participants.find(
    (id) => id !== currentUserId,
  );
  console.warn(otherParticipantId);
  const user = musicians.find((u) => u.id.toString() === otherParticipantId);
  console.warn(user);
  if (user && user.id.toString() !== currentUserId) {
    return {
      displayName: user.name,
      displayAvatar: user.avatar,
      participantId: user.id,
    };
  }

  return {
    displayName: otherParticipantId
      ? `Пользователь #${otherParticipantId}`
      : "Неизвестный",
    displayAvatar: undefined,
    participantId: otherParticipantId ?? null,
  };
};
