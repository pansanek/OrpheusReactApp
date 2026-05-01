import { RolePermissions } from "./moderation.types";

// Константы (только данные, без логики)
export const INSTRUMENTS = [
  "Гитара",
  "Бас-гитара",
  "Ударные",
  "Клавиши",
  "Вокал",
  "Скрипка",
  "Саксофон",
  "Труба",
  "Флейта",
  "Виолончель",
  "Укулеле",
  "Банджо",
  "Мандолина",
  "Арфа",
  "Контрабас",
] as const;

export const GENRES = [
  "Рок",
  "Джаз",
  "Классика",
  "Электроника",
  "Поп",
  "Хип-хоп",
  "Метал",
  "Блюз",
  "Фолк",
  "R&B",
  "Фанк",
  "Кантри",
  "Регги",
  "Соул",
] as const;

export const AI_TAG_CATEGORIES = [
  { id: "activity", name: "Активность", color: "#4361EE" },
  { id: "collaboration", name: "Коллаборация", color: "#3A0CA3" },
  { id: "location", name: "Локация", color: "#4CC9F0" },
  { id: "skill", name: "Навык", color: "#F72585" },
  { id: "goal", name: "Цель", color: "#7209B7" },
] as const;

export const STATUSES = [
  { value: "online", label: "Онлайн" },
  { value: "offline", label: "Не в сети" },
  { value: "busy", label: "Занят" },
] as const;

export const VENUE_TYPES = [
  "студия",
  "репетиционная база",
  "концертный зал",
] as const;

export const USER_ROLES = [
  {
    id: "musician",
    label: "Музыкант",
    description: "Играю на инструментах, ищу группу или коллег",
    icon: "Music",
  },
  {
    id: "teacher",
    label: "Преподаватель",
    description: "Обучаю игре на инструментах или вокалу",
    icon: "GraduationCap",
  },
  {
    id: "venue_admin",
    label: "Площадка",
    description: "Управляю студией, клубом или репетиционной базой",
    icon: "Building2",
  },
  {
    id: "producer",
    label: "Продюсер / Промоутер",
    description: "Продюсирую артистов, организую концерты и мероприятия",
    icon: "Mic2",
  },
  {
    id: "sound_engineer",
    label: "Звукорежиссёр",
    description: "Записываю, свожу и мастерю треки",
    icon: "Sliders",
  },
  {
    id: "journalist",
    label: "Музыкальный журналист",
    description: "Пишу рецензии, беру интервью, веду блог",
    icon: "Newspaper",
  },
  {
    id: "moderator",
    label: "Модератор",
    description: "Модератор",
    icon: "Newspaper",
  },
  {
    id: "admin",
    label: "Администратор",
    description: "Администратор",
    icon: "Newspaper",
  },
] as const;

export const ROLE_PERMISSIONS: RolePermissions = {
  musician: [],
  teacher: [],
  venue_admin: [],
  producer: [],
  sound_engineer: [],
  journalist: [],
  moderator: ["view_reports", "resolve_reports", "delete_content"],
  admin: [
    "view_reports",
    "resolve_reports",
    "ban_users",
    "delete_content",
    "manage_moderators",
  ],
};
export type UserRole = (typeof USER_ROLES)[number]["id"];
export const PUBLIC_REGISTRATION_ROLES = USER_ROLES.filter(
  (role) => !["moderator", "admin"].includes(role.id),
) as ReadonlyArray<{
  id: Exclude<UserRole, "moderator" | "admin">;
  label: string;
  description: string;
  icon: string;
}>;
