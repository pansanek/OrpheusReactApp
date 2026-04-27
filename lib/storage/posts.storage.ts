import { initializeStorage, saveToStorage } from "./utils";
import type { Post } from "@/lib/types";
import { posts as mockPosts } from "@/lib/mock-data/posts.mock";

export function getPosts(): Post[] {
  return initializeStorage("posts", mockPosts);
}

export function savePosts(posts: Post[]): void {
  console.warn(posts);
  saveToStorage("posts", posts);
}

export function getPostById(id: number): Post | undefined {
  return getPosts().find((p) => p.id === id);
}
