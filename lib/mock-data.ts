// Константы
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
];

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
];

export const AI_TAG_CATEGORIES = [
  { id: "activity", name: "Активность", color: "#4361EE" },
  { id: "collaboration", name: "Коллаборация", color: "#3A0CA3" },
  { id: "location", name: "Локация", color: "#4CC9F0" },
  { id: "skill", name: "Навык", color: "#F72585" },
  { id: "goal", name: "Цель", color: "#7209B7" },
];

export const STATUSES = [
  { value: "online", label: "Онлайн" },
  { value: "offline", label: "Не в сети" },
  { value: "busy", label: "Занят" },
  { value: "recording", label: "Запись" },
] as const;

export const VENUE_TYPES = ["студия", "репетиционная база", "концертный зал"];

// --- Роли пользователей ---
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
] as const;

export type UserRole = (typeof USER_ROLES)[number]["id"];

// --- Специфичные данные по ролям ---

export interface TeacherProfile {
  subjects: string[]; // инструменты / дисциплины
  experience: number; // лет опыта
  education: string; // образование
  pricePerHour: number; // стоимость урока
  lessonFormats: string[]; // онлайн / офлайн / оба
  certificates: string[]; // дипломы, сертификаты
  ageGroups: string[]; // дети / взрослые / любой возраст
}

export interface ProducerProfile {
  specialization: string[]; // продюсирование / промоутинг / менеджмент / A&R
  genresWorkedWith: string[];
  artistsWorkedWith: string; // свободное поле
  services: string[]; // продакшн / буккинг / PR / студийное время
  portfolioUrl?: string;
  labelAffiliation?: string;
}

export interface SoundEngineerProfile {
  specialization: string[]; // запись / сведение / мастеринг / live-звук
  software: string[]; // Pro Tools / Ableton / Logic и тп
  hardwareSummary: string;
  genresWorkedWith: string[];
  portfolioUrl?: string;
  studioAffiliation?: string;
}

export interface JournalistProfile {
  mediaOutlets: string[]; // издания / блоги
  specialization: string[]; // рецензии / интервью / репортажи / live-фото
  genresFocus: string[];
  portfolioUrl?: string;
  socialMedia?: string;
}

// --- Основной тип пользователя ---

export interface AITag {
  id: number;
  text: string;
  category: string;
}

export interface Musician {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  instruments: string[];
  genres: string[];
  skillLevel: number;
  location: string;
  avatar: string | null;
  bio: string;
  aiTags: AITag[];
  status: "online" | "offline" | "busy" | "recording";
  socialLinks?: {
    vk?: string;
    youtube?: string;
    soundcloud?: string;
  };
  // Специфичные профили
  teacherProfile?: TeacherProfile;
  producerProfile?: ProducerProfile;
  soundEngineerProfile?: SoundEngineerProfile;
  journalistProfile?: JournalistProfile;
}

export interface OpenPosition {
  instrument: string;
  description?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  genre: string;
  members: number[];
  creatorId: number;
  avatar: string | null;
  createdAt: string;
  openPositions?: OpenPosition[];
  rehearsalSchedule?: string;
  city?: string;
  socialLinks?: {
    vk?: string;
    youtube?: string;
    soundcloud?: string;
  };
}

export interface Comment {
  id: number;
  userId: number;
  text: string;
  timestamp: string;
}

export interface Post {
  id: number;
  authorId: number;
  content: string;
  timestamp: string;
  likes: number[];
  comments: Comment[];
  groupId: number | null;
  image?: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  coordinates: [number, number];
  city: string;
  type: string;
  equipment: string[];
  capacity?: number;
  photos: string[];
  rating: number;
  pricePerHour: number;
  description: string;
  avatar: string | null;
  phone?: string;
  email?: string;
  workingHours?: string;
  socialLinks?: {
    vk?: string;
    instagram?: string;
    website?: string;
  };
}

// Venue admin mapping
export const VENUE_ADMINS: Record<number, number> = {
  1: 3,
  2: 1,
  3: 2,
  4: 4,
};

// --- Моковые данные ---

export const musicians: Musician[] = [
  {
    id: 1,
    name: "Алексей Петров",
    email: "alex@example.com",
    phone: "+7 (916) 123-45-67",
    role: "musician",
    instruments: ["Гитара", "Вокал"],
    genres: ["Рок", "Блюз"],
    skillLevel: 4,
    location: "Москва",
    avatar: "musician-1.png",
    bio: "Профессиональный гитарист с 10-летним опытом. Играю в стиле блюз-рок.",
    aiTags: [
      { id: 1, text: "Ищу рок-группу", category: "collaboration" },
      { id: 2, text: "Готов к концертам", category: "activity" },
    ],
    status: "online",
    socialLinks: { vk: "alex_petrov" },
  },
  {
    id: 2,
    name: "Мария Сидорова",
    email: "maria@example.com",
    phone: "+7 (921) 234-56-78",
    role: "musician",
    instruments: ["Вокал", "Клавиши"],
    genres: ["Джаз", "Поп"],
    skillLevel: 5,
    location: "Санкт-Петербург",
    avatar: "musician-2.png",
    bio: "Джазовая вокалистка, выступаю в клубах города.",
    aiTags: [
      { id: 3, text: "Джем-сессии", category: "activity" },
      { id: 4, text: "Ищу пианиста", category: "collaboration" },
    ],
    status: "online",
    socialLinks: { vk: "maria_sid", youtube: "mariasidorova" },
  },
  {
    id: 3,
    name: "Дмитрий Козлов",
    email: "dmitry@example.com",
    phone: "+7 (903) 345-67-89",
    role: "venue_admin",
    instruments: ["Ударные"],
    genres: ["Рок", "Метал"],
    skillLevel: 4,
    location: "Москва",
    avatar: "musician-3.png",
    bio: 'Барабанщик с опытом студийной работы. Администратор студии "Звук".',
    aiTags: [
      { id: 5, text: "Студийная работа", category: "skill" },
      { id: 6, text: "Ищу группу", category: "collaboration" },
    ],
    status: "busy",
    socialLinks: {},
  },
  {
    id: 4,
    name: "Анна Волкова",
    email: "anna@example.com",
    phone: "+7 (843) 456-78-90",
    role: "musician",
    instruments: ["Скрипка", "Клавиши"],
    genres: ["Классика", "Электроника"],
    skillLevel: 5,
    location: "Казань",
    avatar: "musician-4.png",
    bio: "Классическая скрипачка, экспериментирую с электронной музыкой.",
    aiTags: [
      { id: 7, text: "Эксперименты со звуком", category: "goal" },
      { id: 8, text: "Онлайн-коллаборации", category: "collaboration" },
    ],
    status: "offline",
    socialLinks: { soundcloud: "anna_volkova", youtube: "annavolkova" },
  },
  {
    id: 5,
    name: "Иван Новиков",
    email: "ivan@example.com",
    phone: "+7 (916) 567-89-01",
    role: "musician",
    instruments: ["Бас-гитара"],
    genres: ["Фанк", "Джаз", "R&B"],
    skillLevel: 4,
    location: "Москва",
    avatar: "musician-5.png",
    bio: "Басист-фанкер, люблю грув и ритм.",
    aiTags: [
      { id: 9, text: "Фанк-джемы", category: "activity" },
      { id: 10, text: "Ищу духовиков", category: "collaboration" },
    ],
    status: "recording",
    socialLinks: { vk: "ivan_novikov" },
  },
  {
    id: 6,
    name: "Елена Морозова",
    email: "elena@example.com",
    phone: "+7 (812) 678-90-12",
    role: "teacher",
    instruments: ["Саксофон", "Флейта"],
    genres: ["Джаз", "Классика"],
    skillLevel: 5,
    location: "Санкт-Петербург",
    avatar: "musician-6.png",
    bio: "Профессиональный саксофонист, преподаю музыку более 8 лет.",
    aiTags: [
      { id: 11, text: "Преподавание", category: "skill" },
      { id: 12, text: "Биг-бэнд", category: "collaboration" },
    ],
    status: "online",
    socialLinks: { vk: "elena_moroz" },
    teacherProfile: {
      subjects: ["Саксофон", "Флейта", "Сольфеджио"],
      experience: 8,
      education:
        'СПбГК им. Римского-Корсакова, специальность "Духовые инструменты"',
      pricePerHour: 2500,
      lessonFormats: ["Офлайн", "Онлайн"],
      certificates: ["Диплом СПбГК", "Сертификат Berklee Online"],
      ageGroups: ["Дети", "Взрослые"],
    },
  },
  {
    id: 7,
    name: "Роман Захаров",
    email: "roman@example.com",
    phone: "+7 (495) 789-01-23",
    role: "producer",
    instruments: [],
    genres: ["Поп", "Хип-хоп", "R&B"],
    skillLevel: 5,
    location: "Москва",
    avatar: "musician-7.png",
    bio: "Независимый продюсер и промоутер. Работаю с молодыми артистами и организую концерты.",
    aiTags: [
      { id: 13, text: "Ищу новых артистов", category: "collaboration" },
      { id: 14, text: "Буккинг", category: "skill" },
    ],
    status: "online",
    socialLinks: {},
    producerProfile: {
      specialization: ["Продюсирование", "Промоутинг", "Буккинг"],
      genresWorkedWith: ["Поп", "Хип-хоп", "R&B", "Электроника"],
      artistsWorkedWith: "Более 20 независимых артистов за 5 лет",
      services: ["Продакшн", "Буккинг", "PR-поддержка", "Организация туров"],
      portfolioUrl: "roman-prod.ru",
    },
  },
  {
    id: 8,
    name: "Сергей Лебедев",
    email: "sergey@example.com",
    phone: "+7 (916) 890-12-34",
    role: "sound_engineer",
    instruments: [],
    genres: ["Рок", "Метал", "Электроника"],
    skillLevel: 5,
    location: "Москва",
    avatar: "musician-8.png",
    bio: "Звукорежиссёр с 12-летним опытом. Специализируюсь на записи и сведении рок-музыки.",
    aiTags: [
      { id: 15, text: "Сведение и мастеринг", category: "skill" },
      { id: 16, text: "Студийная запись", category: "activity" },
    ],
    status: "busy",
    socialLinks: { vk: "sergey_sound" },
    soundEngineerProfile: {
      specialization: ["Запись", "Сведение", "Мастеринг"],
      software: ["Pro Tools", "Logic Pro", "Waves"],
      hardwareSummary: "SSL консоль, мониторы Genelec, преампы Neve",
      genresWorkedWith: ["Рок", "Метал", "Электроника", "Поп"],
      studioAffiliation: 'Студия "Звук", Москва',
    },
  },
];

export const groups: Group[] = [
  {
    id: 1,
    name: "Echoes",
    description: "Московская рок-группа, играем каверы и авторский материал.",
    genre: "Рок",
    members: [1, 2],
    creatorId: 1,
    avatar: "band-1.png",
    createdAt: "2024-01-15",
    city: "Москва",
    rehearsalSchedule: "Среда и суббота, 19:00",
    openPositions: [
      {
        instrument: "Бас-гитара",
        description: "Нужен опытный басист для репетиций и концертов",
      },
      {
        instrument: "Вокал",
        description: "Ищем вокалиста/вокалистку с опытом",
      },
    ],
    socialLinks: { vk: "the_echoes_band" },
  },
  {
    id: 2,
    name: "Jazz Collective",
    description: "Джазовый коллектив для джем-сессий и выступлений.",
    genre: "Джаз",
    members: [2, 5, 6],
    creatorId: 2,
    avatar: "band-2.png",
    createdAt: "2024-02-20",
    city: "Санкт-Петербург",
    rehearsalSchedule: "Пятница, 20:00",
    openPositions: [
      {
        instrument: "Труба",
        description: "Ищем трубача для биг-бэнд проектов",
      },
    ],
    socialLinks: { vk: "jazz_collective_spb", youtube: "jazzcollective" },
  },
  {
    id: 3,
    name: "Electronic Dreams",
    description: "Экспериментальный проект на стыке классики и электроники.",
    genre: "Электроника",
    members: [4],
    creatorId: 4,
    avatar: "band-3.png",
    createdAt: "2024-03-10",
    city: "Казань",
    rehearsalSchedule: "По договорённости",
    openPositions: [],
    socialLinks: { soundcloud: "electronicdreams", youtube: "edreams" },
  },
];

export const posts: Post[] = [
  {
    id: 1,
    authorId: 1,
    content:
      "Ищем вокалиста для рок-группы! Репетиции 2 раза в неделю в центре Москвы. Играем классический рок 70-80х.",
    timestamp: "2024-03-15T14:30:00",
    likes: [2, 3, 5],
    comments: [
      {
        id: 1,
        userId: 3,
        text: "Отличная идея! Удачи в поисках!",
        timestamp: "2024-03-15T15:00:00",
      },
    ],
    groupId: null,
  },
  {
    id: 2,
    authorId: 2,
    content:
      'Джем-сессия в эту субботу в клубе "Синий слон"! Приходите все желающие, начало в 20:00.',
    timestamp: "2024-03-14T10:00:00",
    likes: [1, 4, 5, 6],
    comments: [
      {
        id: 2,
        userId: 5,
        text: "Буду обязательно! Беру бас.",
        timestamp: "2024-03-14T11:30:00",
      },
      {
        id: 3,
        userId: 6,
        text: "Приду с саксофоном!",
        timestamp: "2024-03-14T12:00:00",
      },
    ],
    groupId: null,
  },
  {
    id: 3,
    authorId: 4,
    content:
      "Выложила новый трек на SoundCloud — эксперимент со скрипкой и синтезаторами. Буду рада услышать ваше мнение!",
    timestamp: "2024-03-13T18:00:00",
    likes: [1, 2],
    comments: [],
    groupId: null,
  },
  {
    id: 4,
    authorId: 1,
    content:
      "Репетиция прошла отлично! Готовим новую программу к летним фестивалям.",
    timestamp: "2024-03-12T20:00:00",
    likes: [3],
    comments: [],
    groupId: 1,
  },
];

export const venues: Venue[] = [
  {
    id: 1,
    name: 'Студия "Звук"',
    address: "ул. Тверская, 15",
    avatar: "venue-1.png",
    coordinates: [55.751244, 37.587093],
    city: "Москва",
    capacity: 10,
    type: "студия",
    equipment: ["Микрофоны Shure", "Микшер Yamaha", "Мониторы KRK"],
    photos: [],
    rating: 4.8,
    pricePerHour: 2500,
    description:
      "Профессиональная студия звукозаписи с опытными звукорежиссёрами.",
    phone: "+7 (495) 123-45-67",
    email: "info@studiazvuk.ru",
    workingHours: "10:00 — 22:00",
    socialLinks: { vk: "studia_zvuk" },
  },
  {
    id: 2,
    name: 'Репетиционная база "Гараж"',
    address: "ул. Арбат, 42",
    avatar: "venue-2.png",
    coordinates: [55.74221, 37.565128],
    city: "Москва",
    type: "репетиционная база",
    equipment: ["Барабаны Pearl", "Комбики Marshall", "Микрофоны"],
    photos: [],
    capacity: 10,
    rating: 4.5,
    pricePerHour: 1200,
    description: "Уютная репетиционная точка с полным бэклайном.",
    phone: "+7 (495) 234-56-78",
    email: "garazh@mail.ru",
    workingHours: "12:00 — 24:00",
    socialLinks: { vk: "garazh_rep" },
  },
  {
    id: 3,
    name: 'Клуб "Синий слон"',
    address: "Невский пр., 100",
    city: "Москва",
    avatar: "venue-3.png",
    coordinates: [55.707879, 37.587093],
    type: "концертный зал",
    equipment: ["Звук JBL", "Свет Chauvet", "Сцена 6x4м"],
    photos: [],
    capacity: 10,
    rating: 4.7,
    pricePerHour: 5000,
    description: "Джаз-клуб с камерной атмосферой на 100 человек.",
    phone: "+7 (812) 345-67-89",
    email: "blueelephant@club.ru",
    workingHours: "18:00 — 03:00",
    socialLinks: { vk: "blue_elephant_club", instagram: "blueelephant_spb" },
  },
  {
    id: 4,
    name: 'Концертный зал "Калисто"',
    address: "ул. Баумана, 25",
    coordinates: [55.773399, 37.633522],
    city: "Казань",
    type: "концертный зал",
    avatar: "venue-4.png",
    equipment: ["Звук L-Acoustics", "Профессиональный свет", "Сцена 12x8м"],
    photos: [],
    rating: 4.9,
    capacity: 10,
    pricePerHour: 15000,
    description:
      "Большой концертный зал на 500 мест с современным оборудованием.",
    phone: "+7 (843) 456-78-90",
    email: "aurora@concert.ru",
    workingHours: "09:00 — 23:00",
    socialLinks: { vk: "aurora_kazan", website: "aurora-kazan.ru" },
  },
];

// --- Вспомогательные функции ---

export function getMusicianById(id: number): Musician | undefined {
  return musicians.find((m) => m.id === id);
}

export function getGroupById(id: number): Group | undefined {
  return groups.find((g) => g.id === id);
}

export function getVenueById(id: number): Venue | undefined {
  return venues.find((v) => v.id === id);
}

export function getGroupsByMusicianId(musicianId: number): Group[] {
  return groups.filter((g) => g.members.includes(musicianId));
}

export function getPostsByAuthorId(authorId: number): Post[] {
  return posts.filter((p) => p.authorId === authorId);
}

export function getPostsByGroupId(groupId: number): Post[] {
  return posts.filter((p) => p.groupId === groupId);
}

export function searchMusicians(filters: {
  instrument?: string;
  genre?: string;
  location?: string;
  minSkillLevel?: number;
  role?: string;
}): Musician[] {
  return musicians.filter((m) => {
    if (filters.role && m.role !== filters.role) return false;
    if (filters.instrument && !m.instruments.includes(filters.instrument))
      return false;
    if (filters.genre && !m.genres.includes(filters.genre)) return false;
    if (
      filters.location &&
      !m.location.toLowerCase().includes(filters.location.toLowerCase())
    )
      return false;
    if (filters.minSkillLevel && m.skillLevel < filters.minSkillLevel)
      return false;
    return true;
  });
}

export function getRecommendations(
  currentUserId: number,
): { musician: Musician; score: number }[] {
  const currentUser = getMusicianById(currentUserId);
  if (!currentUser) return [];

  return musicians
    .filter((m) => m.id !== currentUserId)
    .map((m) => {
      let score = 0;
      const genreMatch = m.genres.filter((g) =>
        currentUser.genres.includes(g),
      ).length;
      score += genreMatch * 0.2;
      if (m.location === currentUser.location) score += 0.3;
      const userTagTexts = currentUser.aiTags.map((t) => t.text.toLowerCase());
      const matchingTags = m.aiTags.filter((t) =>
        userTagTexts.some(
          (ut) =>
            t.text.toLowerCase().includes(ut) ||
            ut.includes(t.text.toLowerCase()),
        ),
      ).length;
      score += matchingTags * 0.25;
      return { musician: m, score: Math.min(score, 1) };
    })
    .sort((a, b) => b.score - a.score);
}
