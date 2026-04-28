// === Типы контента, который можно зарепортить ===
export type ReportTargetType = "post" | "message" | "profile";

// === Причины репорта ===
export type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate_content"
  | "fake_profile"
  | "copyright_violation"
  | "off_topic"
  | "other";

// === Статусы репорта ===
export type ReportStatus =
  | "pending" // ждёт рассмотрения
  | "reviewed" // просмотрен, но без действий
  | "resolved" // контент удалён/пользователь заблокирован
  | "dismissed"; // репорт отклонён (ложный)

// === Статусы модерации для контента ===
export type ModerationStatus =
  | "approved" // одобрено / чисто
  | "pending" // на проверке (для премодерации)
  | "flagged" // помечено системой или пользователями
  | "rejected"; // отклонено / удалено

// === Основной тип репорта ===
export interface ModerationReport {
  id: string;
  reporterId: string; // кто отправил
  reporterName?: string; // кэш имени для отображения
  targetId: string; // ID поста / сообщения / профиля
  targetType: ReportTargetType; // тип цели
  reason: ReportReason; // причина
  customReason?: string; // если reason === 'other'
  description?: string; // дополнительный комментарий
  timestamp: number; // Date.now()
  status: ReportStatus; // статус обработки
  reviewedBy?: string; // ID модератора, если рассмотрен
  reviewedAt?: number; // когда рассмотрен
  resolution?: string; // комментарий модератора о решении
}

// === Расширенные поля для Post (добавить в post.types.ts) ===
export interface PostModerationFields {
  moderationStatus?: ModerationStatus; // по умолчанию 'approved'
  flaggedAt?: number; // когда помечен
  reportCount?: number; // количество репортов
  reports?: string[]; // IDs связанных ModerationReport
  hiddenFromFeed?: boolean; // скрыт из ленты до проверки
}

// === Расширенные поля для Message (добавить в chat.types.ts) ===
export interface MessageModerationFields {
  isFlagged?: boolean;
  reportCount?: number;
  reports?: string[];
  hidden?: boolean;
}

// === Расширенные поля для Musician/Profile (добавить в user.types.ts) ===
export interface ProfileModerationFields {
  verificationStatus?: "none" | "pending" | "verified" | "rejected";
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: number;
  bannedBy?: string;
  reportCount?: number;
  reports?: string[];
  profileStatus?: "active" | "under_review" | "suspended";
}

// === Тип для очереди модерации в админ-панели ===
export interface ModerationQueueItem {
  report: ModerationReport;
  targetContent?: {
    preview?: string;
    authorId?: string;
    authorName?: string;
    mediaPreview?: string;
  };
}

// === Права доступа для ролей (расширение USER_ROLES) ===
export type ModerationPermission =
  | "view_reports"
  | "resolve_reports"
  | "ban_users"
  | "delete_content"
  | "manage_moderators";

export interface RolePermissions {
  [roleId: string]: ModerationPermission[];
}
