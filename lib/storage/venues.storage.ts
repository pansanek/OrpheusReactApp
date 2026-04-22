import { initializeStorage, saveToStorage } from "./utils";
import type { Venue } from "@/lib/types";
import { venues as mockVenues } from "@/lib/mock-data/venues.mock";

export function getVenues(): Venue[] {
  return initializeStorage("venues", mockVenues);
}

export function saveVenues(venues: Venue[]): void {
  saveToStorage("venues", venues);
}

export function getVenueById(id: number): Venue | undefined {
  return getVenues().find((v) => v.id === id);
}
