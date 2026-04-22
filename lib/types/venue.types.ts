export interface Venue {
  id: number;
  name: string;
  address: string;
  coordinates: [number, number]; // [lat, lng]
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
  socialLinks?: { vk?: string; instagram?: string; website?: string };
}

// Маппинг venueId → adminUserId (для моков)
export const VENUE_ADMINS: Record<number, number> = { 1: 3, 2: 1, 3: 2, 4: 4 };
