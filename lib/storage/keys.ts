export const STORAGE_KEYS = {
  musicians: "umpsm_musicians",
  groups: "umpsm_groups",
  venues: "umpsm_venues",
  posts: "umpsm_posts",
  chats: "umpsm_chats",
  messages: "umpsm_messages",
  notifications: "umpsm_notifications",
  joinRequests: "umpsm_join_requests",
  sentInvites: "umpsm_sent_invites",
  bookings: "umpsm_bookings",
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
