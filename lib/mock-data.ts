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
];

export const AI_TAG_CATEGORIES = [
  { id: "activity", name: "Активность", color: "#4361EE" },
  { id: "collaboration", name: "Коллаборация", color: "#3A0CA3" },
  { id: "location", name: "Локация", color: "#4CC9F0" },
  { id: "skill", name: "Навык", color: "#F72585" },
  { id: "goal", name: "Цель", color: "#7209B7" },
];

// Типы
export interface AITag {
  id: number;
  text: string;
  category: string;
}

export interface Musician {
  id: number;
  name: string;
  email: string;
  instruments: string[];
  genres: string[];
  skillLevel: number;
  location: string;
  avatar: string | null;
  bio: string;
  aiTags: AITag[];
  status: "online" | "offline" | "busy" | "recording";
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
  id: string;
  name: string;
  type: "студия" | "репетиционная база" | "концертный зал";
  address: string;
  coordinates: [number, number]; // [latitude, longitude] для Яндекс Карт
  description: string;
  equipment: string[];
  rating: number;
  pricePerHour: number;
  phone?: string;
  email?: string;
  website?: string;
  workingHours?: string;
  capacity?: number;
}

// Моковые данные музыкантов
export const musicians: Musician[] = [
  {
    id: 1,
    name: "Александр Потемкин",
    email: "alex@example.com",
    instruments: ["Гитара", "Вокал"],
    genres: ["Рок", "Блюз"],
    skillLevel: 4,
    location: "Москва",
    avatar: "/1.png",
    bio: "Профессиональный гитарист с 10-летним опытом. Играю в стиле блюз-рок.",
    aiTags: [
      { id: 1, text: "Ищу рок-группу", category: "collaboration" },
      { id: 2, text: "Готов к концертам", category: "activity" },
    ],
    status: "online",
  },
  {
    id: 2,
    name: "Алексей Темников",
    email: "temnikov@example.com",
    instruments: ["Вокал", "Клавиши"],
    genres: ["Джаз", "Поп"],
    skillLevel: 5,
    location: "Санкт-Петербург",
    avatar: "/2.png",
    bio: "Джазовая вокалистка, выступаю в клубах города.",
    aiTags: [
      { id: 3, text: "Джем-сессии", category: "activity" },
      { id: 4, text: "Ищу пианиста", category: "collaboration" },
    ],
    status: "online",
  },
  {
    id: 3,
    name: "Артём Попов",
    email: "dmitry@example.com",
    instruments: ["Ударные"],
    genres: ["Рок", "Метал"],
    skillLevel: 4,
    location: "Москва",
    avatar: "/3.png",
    bio: "Барабанщик с опытом студийной работы.",
    aiTags: [
      { id: 5, text: "Студийная работа", category: "skill" },
      { id: 6, text: "Ищу группу", category: "collaboration" },
    ],
    status: "busy",
  },
  {
    id: 4,
    name: "Анна Волкова",
    email: "anna@example.com",
    instruments: ["Скрипка", "Клавиши"],
    genres: ["Классика", "Электроника"],
    skillLevel: 5,
    location: "Казань",
    avatar: null,
    bio: "Классическая скрипачка, экспериментирую с электронной музыкой.",
    aiTags: [
      { id: 7, text: "Эксперименты со звуком", category: "goal" },
      { id: 8, text: "Онлайн-коллаборации", category: "collaboration" },
    ],
    status: "offline",
  },
  {
    id: 5,
    name: "Иван Новиков",
    email: "ivan@example.com",
    instruments: ["Бас-гитара"],
    genres: ["Фанк", "Джаз", "R&B"],
    skillLevel: 4,
    location: "Москва",
    avatar: null,
    bio: "Басист-фанкер, люблю грув и ритм.",
    aiTags: [
      { id: 9, text: "Фанк-джемы", category: "activity" },
      { id: 10, text: "Ищу духовиков", category: "collaboration" },
    ],
    status: "recording",
  },
  {
    id: 6,
    name: "Елена Морозова",
    email: "elena@example.com",
    instruments: ["Саксофон", "Флейта"],
    genres: ["Джаз", "Классика"],
    skillLevel: 5,
    location: "Санкт-Петербург",
    avatar: null,
    bio: "Профессиональный саксофонист, преподаю музыку.",
    aiTags: [
      { id: 11, text: "Преподавание", category: "skill" },
      { id: 12, text: "Биг-бэнд", category: "collaboration" },
    ],
    status: "online",
  },
];

// Моковые данные групп
export const groups: Group[] = [
  {
    id: 1,
    name: "The Voltage",
    description: "Московская рок-группа, играем каверы и авторский материал.",
    genre: "Рок",
    members: [1, 3],
    creatorId: 1,
    avatar: null,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Jazz Collective",
    description: "Джазовый коллектив для джем-сессий и выступлений.",
    genre: "Джаз",
    members: [2, 5, 6],
    creatorId: 2,
    avatar: null,
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "Electronic Dreams",
    description: "Экспериментальный проект на стыке классики и электроники.",
    genre: "Электроника",
    members: [4],
    creatorId: 4,
    avatar: null,
    createdAt: "2024-03-10",
  },
];

// Моковые данные постов
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
      "Выложила новый трек на SoundCloud - эксперимент со скрипкой и синтезаторами. Буду рада услышать ваше мнение!",
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

// Моковые данные учреждений
export const venues: Venue[] = [
  {
    id: "1",
    name: 'Звукозаписывающая студия "Мелодия"',
    type: "студия",
    address: "Москва, ул. Тверская, д. 15",
    coordinates: [55.764399, 37.605522],
    description:
      "Профессиональная студия звукозаписи с современным оборудованием и опытными звукорежиссерами",
    equipment: [
      "Neumann U87",
      "SSL консоль",
      "Pro Tools",
      "Vocal Booth",
      "Мониторы Genelec",
    ],
    rating: 4.8,
    pricePerHour: 3500,
    phone: "+7 (495) 123-45-67",
    workingHours: "10:00 - 22:00",
    capacity: 5,
  },
  {
    id: "2",
    name: 'Репетиционная база "Рок-Клуб"',
    type: "репетиционная база",
    address: "Москва, ул. Арбат, д. 42",
    coordinates: [55.751244, 37.587093],
    description:
      "Комфортная репетиционная база с несколькими залами разного размера",
    equipment: [
      "Усилители Marshall",
      "Барабанная установка Tama",
      "Микрофоны Shure",
      "Комбики Fender",
    ],
    rating: 4.5,
    pricePerHour: 1200,
    phone: "+7 (495) 234-56-78",
    workingHours: "12:00 - 00:00",
    capacity: 10,
  },
  {
    id: "3",
    name: 'Концертный зал "Филармония"',
    type: "концертный зал",
    address: "Москва, Триумфальная площадь, д. 4",
    coordinates: [55.768135, 37.593956],
    description:
      "Престижный концертный зал с великолепной акустикой для проведения концертов и мероприятий",
    equipment: [
      "Рояль Steinway",
      "Концертная акустическая система",
      "Профессиональный свет",
      "Видеопроекция",
    ],
    rating: 4.9,
    pricePerHour: 15000,
    phone: "+7 (495) 345-67-89",
    workingHours: "09:00 - 23:00",
    capacity: 500,
  },
  {
    id: "4",
    name: 'Студия "Pro Sound"',
    type: "студия",
    address: "Москва, Кутузовский проспект, д. 12",
    coordinates: [55.74221, 37.565128],
    description:
      "Современная студия для записи, сведения и мастеринга любых музыкальных проектов",
    equipment: [
      "Neve консоль",
      "Logic Pro X",
      "Ableton Live",
      "API пре-ампы",
      "Множество синтезаторов",
    ],
    rating: 4.7,
    pricePerHour: 4000,
    phone: "+7 (495) 456-78-90",
    workingHours: "11:00 - 23:00",
    capacity: 8,
  },
  {
    id: "5",
    name: 'Репетиционная "Андеграунд"',
    type: "репетиционная база",
    address: "Москва, ул. Новый Арбат, д. 24",
    coordinates: [55.752587, 37.580017],
    description: "Недорогая репетиционная база для молодых музыкантов",
    equipment: [
      "Барабаны",
      "Бас-гитарный комбик",
      "Гитарные комбики",
      "Микрофоны",
    ],
    rating: 4.2,
    pricePerHour: 800,
    phone: "+7 (495) 567-89-01",
    workingHours: "14:00 - 02:00",
    capacity: 6,
  },
  {
    id: "6",
    name: 'Клуб "16 тонн"',
    type: "концертный зал",
    address: "Москва, Пресненская набережная, д. 6",
    coordinates: [55.74897, 37.53947],
    description:
      "Легендарный московский клуб с отличной площадкой для живых выступлений",
    equipment: ["Сцена 8x6м", "Концертный звук", "Световое шоу", "Бар"],
    rating: 4.6,
    pricePerHour: 8000,
    phone: "+7 (495) 678-90-12",
    workingHours: "18:00 - 05:00",
    capacity: 300,
  },
  {
    id: "7",
    name: 'Студия "Мастерская звука"',
    type: "студия",
    address: "Москва, Ленинский проспект, д. 38",
    coordinates: [55.707879, 37.587093],
    description:
      "Камерная студия с домашней атмосферой и качественным оборудованием",
    equipment: [
      "Universal Audio",
      "Yamaha NS-10",
      "Cubase",
      "Множество плагинов",
    ],
    rating: 4.4,
    pricePerHour: 2500,
    phone: "+7 (495) 789-01-23",
    workingHours: "10:00 - 20:00",
    capacity: 4,
  },
  {
    id: "8",
    name: 'Репетиционная "Гараж"',
    type: "репетиционная база",
    address: "Москва, ул. Садовая-Спасская, д. 21",
    coordinates: [55.773399, 37.633522],
    description:
      "Простая репетиционная база с базовым оборудованием по доступным ценам",
    equipment: ["Барабаны", "Комбики", "Микрофоны", "Кабели"],
    rating: 4.0,
    pricePerHour: 600,
    phone: "+7 (495) 890-12-34",
    workingHours: "12:00 - 00:00",
    capacity: 5,
  },
];

// Функции для работы с данными
export function getMusicianById(id: number): Musician | undefined {
  return musicians.find((m) => m.id === id);
}

export function getGroupById(id: number): Group | undefined {
  return groups.find((g) => g.id === id);
}

export function getVenueById(id: string): Venue | undefined {
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
}): Musician[] {
  return musicians.filter((m) => {
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

      // Совпадение жанров
      const genreMatch = m.genres.filter((g) =>
        currentUser.genres.includes(g),
      ).length;
      score += genreMatch * 0.2;

      // Совпадение локации
      if (m.location === currentUser.location) score += 0.3;

      // Совпадение тегов
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
