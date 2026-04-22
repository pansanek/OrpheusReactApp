import { getChats } from "./chats.storage";
import { getGroups } from "./groups.storage";
import { getJoinRequests } from "./join-requests.storage";
import { getMessages } from "./messages.storage";
import { getMusicians } from "./musicians.storage";
import { getNotifications } from "./notifications.storage";
import { getPosts } from "./posts.storage";
import { getSentInvites } from "./sent-invites.storage";
import { getVenues } from "./venues.storage";

// Удобный импорт всех функций хранения
export * from "./keys";
export * from "./utils";

export * from "./musicians.storage";
export * from "./groups.storage";
export * from "./posts.storage";
export * from "./venues.storage";
export * from "./chats.storage";
export * from "./messages.storage";
export * from "./notifications.storage";
export * from "./sent-invites.storage";
export * from "./join-requests.storage";

export function initializeAllMockData(): void {
  if (typeof window === "undefined") return;
  getMusicians();
  getGroups();
  getVenues();
  getPosts();
  getChats();
  getMessages();
  getNotifications();
  getJoinRequests();
  getSentInvites();
  
}
