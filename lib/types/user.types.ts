import type { UserRole } from "./constants";
import type { AITag } from "./ai.types";

export interface TeacherProfile {
  subjects: string[];
  experience: number;
  education: string;
  pricePerHour: number;
  lessonFormats: string[];
  certificates: string[];
  ageGroups: string[];
}

export interface ProducerProfile {
  specialization: string[];
  genresWorkedWith: string[];
  artistsWorkedWith: string;
  services: string[];
  portfolioUrl?: string;
  labelAffiliation?: string;
}

export interface SoundEngineerProfile {
  specialization: string[];
  software: string[];
  hardwareSummary: string;
  genresWorkedWith: string[];
  portfolioUrl?: string;
  studioAffiliation?: string;
}

export interface JournalistProfile {
  mediaOutlets: string[];
  specialization: string[];
  genresFocus: string[];
  portfolioUrl?: string;
  socialMedia?: string;
}

export interface Musician {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  instruments: string[];
  genres: string[];
  skillLevel: number; // 1-5
  location: string;
  avatar: string | null;
  bio: string;
  aiTags: AITag[];
  status: "online" | "offline" | "busy" | "recording";
  socialLinks?: { vk?: string; youtube?: string; soundcloud?: string };
  teacherProfile?: TeacherProfile;
  producerProfile?: ProducerProfile;
  soundEngineerProfile?: SoundEngineerProfile;
  journalistProfile?: JournalistProfile;
}
