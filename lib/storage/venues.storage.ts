import { initializeStorage, saveToStorage } from "./utils";
import { VENUE_ADMINS, type Venue } from "@/lib/types";
import { venues as mockVenues } from "@/lib/mock-data/venues.mock";

export function getVenues(): Venue[] {
  return initializeStorage("venues", mockVenues);
}

export function saveVenues(venues: Venue[]): void {
  saveToStorage("venues", venues);
}

export function getVenueById(id: string): Venue | undefined {
  return getVenues().find((v) => v.id === id);
}
export function getVenueByAdminId(id: string): Venue | undefined {
  const venueId = Object.entries(VENUE_ADMINS).find(
    ([, adminId]) => adminId === id,
  )?.[0];
  const venue = getVenues().find((v) => v.id === venueId);
  return venue;
}
