export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string; // ISO string
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: string; // ISO string
  likes: string[]; // массив id пользователей
  comments: Comment[];
  groupId: string | null;
  media?: { type: "image" | "video" | "audio"; url: string; name?: string }[];
}
