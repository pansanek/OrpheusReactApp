export interface Comment {
  id: number;
  userId: number;
  text: string;
  timestamp: string; // ISO string
}

export interface Post {
  id: number;
  authorId: number;
  content: string;
  timestamp: string; // ISO string
  likes: number[]; // массив id пользователей
  comments: Comment[];
  groupId: number | null;
  image?: string;
}
