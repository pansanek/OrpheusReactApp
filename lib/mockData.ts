import type { Musician, Group, Post, Venue, AITag } from './types';

// Моковые музыканты
export const musicians: Musician[] = [
  {
    id: 1,
    name: 'Алексей Петров',
    email: 'alex@example.com',
    instruments: ['Гитара', 'Вокал'],
    genres: ['Рок', 'Инди'],
    skillLevel: 4,
    location: 'Москва',
    avatar: null,
    bio: 'Гитарист с 10-летним стажем. Ищу группу для серьёзных проектов.',
    aiTags: [
      { id: 1, text: 'ищу группу', category: 'goal' },
      { id: 2, text: 'готов к гастролям', category: 'activity' },
    ],
  },
  {
    id: 2,
    name: 'Мария Иванова',
    email: 'maria@example.com',
    instruments: ['Клавишные', 'Вокал'],
    genres: ['Джаз', 'Классика'],
    skillLevel: 5,
    location: 'Санкт-Петербург',
    avatar: null,
    bio: 'Выпускница консерватории. Преподаю и выступаю.',
    aiTags: [
      { id: 3, text: 'преподаю', category: 'activity' },
      { id: 4, text: 'ищу джем-партнёров', category: 'collaboration' },
    ],
  },
  {
    id: 3,
    name: 'Дмитрий Козлов',
    email: 'dmitry@example.com',
    instruments: ['Барабаны'],
    genres: ['Рок', 'Метал'],
    skillLevel: 4,
    location: 'Москва',
    avatar: null,
    bio: 'Барабанщик. Играю в нескольких проектах.',
    aiTags: [
      { id: 5, text: 'свободен для сессий', category: 'collaboration' },
      { id: 6, text: 'записываю в студии', category: 'activity' },
    ],
  },
  {
    id: 4,
    name: 'Елена Смирнова',
    email: 'elena@example.com',
    instruments: ['Бас-гитара'],
    genres: ['Фанк', 'R&B'],
    skillLevel: 3,
    location: 'Екатеринбург',
    avatar: null,
    bio: 'Басистка-самоучка. Люблю грув и фанк.',
    aiTags: [
      { id: 7, text: 'ищу группу', category: 'goal' },
      { id: 8, text: 'начинающая', category: 'skill' },
    ],
  },
  {
    id: 5,
    name: 'Андрей Волков',
    email: 'andrey@example.com',
    instruments: ['Синтезатор', 'DJ-оборудование'],
    genres: ['Электроника', 'Хип-хоп'],
    skillLevel: 4,
    location: 'Москва',
    avatar: null,
    bio: 'Электронный музыкант и продюсер.',
    aiTags: [
      { id: 9, text: 'ищу вокалиста', category: 'collaboration' },
      { id: 10, text: 'пишу биты', category: 'activity' },
    ],
  },
  {
    id: 6,
    name: 'Ольга Новикова',
    email: 'olga@example.com',
    instruments: ['Скрипка'],
    genres: ['Классика', 'Фолк'],
    skillLevel: 5,
    location: 'Санкт-Петербург',
    avatar: null,
    bio: 'Скрипачка симфонического оркестра. Интересуют кроссовер-проекты.',
    aiTags: [
      { id: 11, text: 'интересует кроссовер', category: 'goal' },
      { id: 12, text: 'профессионал', category: 'skill' },
    ],
  },
];

// Моковые группы
export const groups: Group[] = [
  {
    id: 1,
    name: 'Звёздный Ветер',
    description: 'Рок-группа, играющая авторский материал',
    genre: 'Рок',
    members: [1, 3],
    creatorId: 1,
    avatar: null,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Jazz Collective',
    description: 'Джазовый коллектив для джем-сессий',
    genre: 'Джаз',
    members: [2],
    creatorId: 2,
    avatar: null,
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    name: 'Electric Dreams',
    description: 'Электронный проект с живыми инструментами',
    genre: 'Электроника',
    members: [5],
    creatorId: 5,
    avatar: null,
    createdAt: '2024-03-10',
  },
];

// Моковые посты
export const posts: Post[] = [
  {
    id: 1,
    authorId: 1,
    content: 'Ищу барабанщика для рок-группы! Репетиции 2 раза в неделю в центре Москвы. Пишите в личку!',
    timestamp: '2024-12-01T10:30:00',
    likes: [2, 3, 5],
    comments: [
      { id: 1, userId: 3, text: 'Интересно! Напишу в личку.', timestamp: '2024-12-01T11:00:00' },
    ],
    groupId: null,
  },
  {
    id: 2,
    authorId: 2,
    content: 'Провели отличную джем-сессию вчера! Спасибо всем, кто пришёл. Фото в комментариях.',
    timestamp: '2024-12-02T15:45:00',
    likes: [1, 4, 6],
    comments: [
      { id: 2, userId: 6, text: 'Было классно! Когда следующая?', timestamp: '2024-12-02T16:00:00' },
    ],
    groupId: 2,
  },
  {
    id: 3,
    authorId: 5,
    content: 'Новый трек в работе! Ищу вокалиста/вокалистку для записи. Жанр: электроника с элементами хип-хопа.',
    timestamp: '2024-12-03T09:15:00',
    likes: [1, 2, 4],
    comments: [],
    groupId: null,
  },
  {
    id: 4,
    authorId: 3,
    content: 'Кто-нибудь знает хорошую студию для записи барабанов в Москве? Нужна большая комната с хорошей акустикой.',
    timestamp: '2024-12-04T14:20:00',
    likes: [1],
    comments: [
      { id: 3, userId: 1, text: 'Пробовал SoundLab? У них отличная комната.', timestamp: '2024-12-04T14:45:00' },
    ],
    groupId: null,
  },
];

// Моковые учреждения
export const venues: Venue[] = [
  {
    id: 1,
    name: 'SoundLab Studio',
    address: 'Москва, ул. Музыкальная, 15',
    type: 'Студия',
    equipment: ['Микрофоны', 'Звуковая система', 'Микшерный пульт', 'Мониторы'],
    photos: [],
    rating: 4.8,
    pricePerHour: 2500,
  },
  {
    id: 2,
    name: 'Rock Base',
    address: 'Москва, ул. Рок-н-ролла, 42',
    type: 'Репетиционная база',
    equipment: ['Барабанная установка', 'Комбоусилители', 'Микрофоны', 'Звуковая система'],
    photos: [],
    rating: 4.5,
    pricePerHour: 800,
  },
  {
    id: 3,
    name: 'Jazz Club "Blue Note"',
    address: 'Санкт-Петербург, Невский пр., 100',
    type: 'Клуб',
    equipment: ['Пианино', 'Звуковая система', 'Свет', 'Сцена'],
    photos: [],
    rating: 4.9,
    pricePerHour: 5000,
  },
  {
    id: 4,
    name: 'Концертный зал "Аврора"',
    address: 'Москва, Концертный проезд, 1',
    type: 'Концертный зал',
    equipment: ['Звуковая система', 'Свет', 'Сцена', 'Проектор', 'Мониторы'],
    photos: [],
    rating: 4.7,
    pricePerHour: 15000,
  },
];

// Предустановленные теги ИИ
export const presetAITags: AITag[] = [
  { id: 101, text: 'ищу группу', category: 'goal' },
  { id: 102, text: 'ищу музыкантов', category: 'collaboration' },
  { id: 103, text: 'готов к гастролям', category: 'activity' },
  { id: 104, text: 'ищу джем-партнёров', category: 'collaboration' },
  { id: 105, text: 'записываю в студии', category: 'activity' },
  { id: 106, text: 'преподаю', category: 'activity' },
  { id: 107, text: 'ищу вокалиста', category: 'collaboration' },
  { id: 108, text: 'ищу барабанщика', category: 'collaboration' },
  { id: 109, text: 'профессионал', category: 'skill' },
  { id: 110, text: 'начинающий', category: 'skill' },
  { id: 111, text: 'Москва', category: 'location' },
  { id: 112, text: 'Санкт-Петербург', category: 'location' },
  { id: 113, text: 'пишу музыку', category: 'activity' },
  { id: 114, text: 'интересует кроссовер', category: 'goal' },
];
