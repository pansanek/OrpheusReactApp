export interface OpenPosition {
  instrument: string;
  description?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  genre: string;
  members: number[]; // массив id музыкантов
  creatorId: number;
  avatar: string | null;
  createdAt: string; // ISO string
  openPositions?: OpenPosition[];
  rehearsalSchedule?: string;
  city?: string;
  socialLinks?: { vk?: string; youtube?: string; soundcloud?: string };
}
