import type { Group } from "@/lib/types";

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
