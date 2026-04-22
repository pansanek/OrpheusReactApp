import { initializeStorage, saveToStorage } from "./utils";
import type { Group } from "@/lib/types";
import { groups as mockGroups } from "@/lib/mock-data/groups.mock";

export function getGroups(): Group[] {
  return initializeStorage("groups", mockGroups);
}

export function saveGroups(groups: Group[]): void {
  saveToStorage("groups", groups);
}

export function getGroupById(id: number): Group | undefined {
  return getGroups().find((g) => g.id === id);
}

export function getPostsByGroupId(
  groupId: number,
  posts: import("@/lib/types").Post[],
): import("@/lib/types").Post[] {
  return posts.filter((p) => p.groupId === groupId);
}
