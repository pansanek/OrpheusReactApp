export interface OpenPosition {
  instrument: string;
  description?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  genre: string;
  members: string[]; // массив id музыкантов
  creatorId: string;
  avatar: string | null;
  createdAt: string; // ISO string
  openPositions?: OpenPosition[];
  rehearsalSchedule?: string;
  city?: string;
  socialLinks?: { vk?: string; youtube?: string; soundcloud?: string };
}
