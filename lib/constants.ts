// Музыкальные инструменты
export const INSTRUMENTS = [
  'Гитара',
  'Бас-гитара',
  'Барабаны',
  'Клавишные',
  'Вокал',
  'Скрипка',
  'Виолончель',
  'Саксофон',
  'Труба',
  'Флейта',
  'Контрабас',
  'Синтезатор',
  'DJ-оборудование',
  'Укулеле',
  'Аккордеон',
] as const;

// Музыкальные жанры
export const GENRES = [
  'Рок',
  'Джаз',
  'Классика',
  'Электроника',
  'Поп',
  'Хип-хоп',
  'Метал',
  'Блюз',
  'Фанк',
  'R&B',
  'Кантри',
  'Регги',
  'Инди',
  'Фолк',
  'Панк',
] as const;

// Цвета жанров
export const GENRE_COLORS: Record<string, string> = {
  'Рок': '#FF6B6B',
  'Джаз': '#4ECDC4',
  'Классика': '#FFD166',
  'Электроника': '#9D4EDD',
  'Поп': '#06D6A0',
  'Хип-хоп': '#118AB2',
  'Метал': '#E63946',
  'Блюз': '#457B9D',
  'Фанк': '#F4A261',
  'R&B': '#2A9D8F',
  'Кантри': '#D4A373',
  'Регги': '#81B29A',
  'Инди': '#F2CC8F',
  'Фолк': '#A8DADC',
  'Панк': '#E76F51',
};

// Уровни навыков
export const SKILL_LEVELS = [
  { value: 1, label: 'Начинающий' },
  { value: 2, label: 'Любитель' },
  { value: 3, label: 'Средний' },
  { value: 4, label: 'Продвинутый' },
  { value: 5, label: 'Профессионал' },
] as const;

// Категории тегов ИИ
export const AI_TAG_CATEGORIES = [
  { id: 'activity', label: 'Активность', color: '#4361EE' },
  { id: 'collaboration', label: 'Коллаборация', color: '#3A0CA3' },
  { id: 'location', label: 'Локация', color: '#4CC9F0' },
  { id: 'skill', label: 'Навык', color: '#F72585' },
  { id: 'goal', label: 'Цель', color: '#7209B7' },
] as const;

// Типы учреждений
export const VENUE_TYPES = [
  'Студия',
  'Концертный зал',
  'Репетиционная база',
  'Клуб',
  'Бар',
] as const;

// Оборудование
export const EQUIPMENT = [
  'Микрофоны',
  'Звуковая система',
  'Барабанная установка',
  'Комбоусилители',
  'Микшерный пульт',
  'Мониторы',
  'Свет',
  'Пианино',
  'Проектор',
  'Сцена',
] as const;

// Навигация
export const NAV_ITEMS = [
  { href: '/', label: 'Главная', icon: 'home' },
  { href: '/feed', label: 'Лента', icon: 'newspaper' },
  { href: '/search', label: 'Поиск', icon: 'search' },
  { href: '/groups', label: 'Группы', icon: 'users' },
  { href: '/venues', label: 'Площадки', icon: 'building' },
  { href: '/ai-tags', label: 'ИИ-теги', icon: 'tags' },
  { href: '/recommendations', label: 'Рекомендации', icon: 'sparkles' },
] as const;

export type Instrument = (typeof INSTRUMENTS)[number];
export type Genre = (typeof GENRES)[number];
export type VenueType = (typeof VENUE_TYPES)[number];
export type Equipment = (typeof EQUIPMENT)[number];
