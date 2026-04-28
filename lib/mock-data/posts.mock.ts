import type { Post } from "@/lib/types";

export const posts: Post[] = [
  {
    id: "1",
    authorId: "1",
    content:
      "Ищем вокалиста для рок-группы! Репетиции 2 раза в неделю в центре Москвы. Играем классический рок 70-80х.",
    timestamp: "2024-03-15T14:30:00",
    likes: ["2", "3", "5"],
    comments: [
      {
        id: "1",
        userId: "3",
        text: "Отличная идея! Удачи в поисках!",
        timestamp: "2024-03-15T15:00:00",
      },
    ],
    groupId: null,
  },
  {
    id: "2",
    authorId: "2",
    content:
      'Джем-сессия в эту субботу в клубе "Синий слон"! Приходите все желающие, начало в 20:00.',
    timestamp: "2024-03-14T10:00:00",
    likes: ["1", "4", "5", "6"],
    comments: [
      {
        id: "2",
        userId: "5",
        text: "Буду обязательно! Беру бас.",
        timestamp: "2024-03-14T11:30:00",
      },
      {
        id: "3",
        userId: "6",
        text: "Приду с саксофоном!",
        timestamp: "2024-03-14T12:00:00",
      },
    ],
    groupId: null,
  },
  {
    id: "3",
    authorId: "4",
    content:
      "Выложила новый трек на SoundCloud — эксперимент со скрипкой и синтезаторами. Буду рада услышать ваше мнение!",
    timestamp: "2024-03-13T18:00:00",
    likes: ["1", "2"],
    comments: [],
    groupId: null,
  },
  {
    id: "4",
    authorId: "1",
    content:
      "Репетиция прошла отлично! Готовим новую программу к летним фестивалям.",
    timestamp: "2024-03-12T20:00:00",
    likes: ["3"],
    comments: [],
    groupId: "1",
    media: [
      {
        type: "image",
        url: "musician-1.png",
        name: "rehearsal.jpg",
      },
    ],
  },
];
