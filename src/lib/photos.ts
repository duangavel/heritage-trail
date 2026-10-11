import type { ImageMetadata } from "astro";
import photosData from "../data/photos.json";
import { STOPS, type Stop } from "./trail";

/** One photo as recorded in src/data/photos.json. */
export interface PhotoEntry {
  /** Path inside src/assets/photos/. */
  file: string;
  /** Original's path inside the local images/ folder (not committed). */
  source: string;
  alt: string;
  caption: string;
  /** Applied by npm run photos: rotation in degrees, then a trim given as fractions of the straightened photo. */
  crop?: { rotate?: number; left: number; top: number; width: number; height: number };
}
export interface PhotoEvent {
  id: string;
  title: string;
  /** YYYY-MM-DD, or null if unknown. */
  date: string | null;
  /** Show on the home page's Dedications timeline. */
  timeline: boolean;
  photos: PhotoEntry[];
}
interface StopPhotos { lead?: PhotoEntry; note?: string; events: PhotoEvent[] }

export const PHOTOGRAPHER: string = photosData.photographer;
const byStop = photosData.stops as Record<string, StopPhotos>;

const files = import.meta.glob<{ default: ImageMetadata }>("../assets/photos/**/*.{jpg,jpeg,png,webp}", { eager: true });

/** The optimizable image for a photo entry; fails the build if the file is missing. */
export function imageFor(p: PhotoEntry): ImageMetadata {
  const mod = files[`../assets/photos/${p.file}`];
  if (!mod) throw new Error(`Photo "${p.file}" is listed in src/data/photos.json but missing from src/assets/photos. Run "npm run photos".`);
  return mod.default;
}

export const photosFor = (id: string): StopPhotos => byStop[id] ?? { events: [] };

/** Timeline entries, oldest first. */
export function timeline(): { stop: Stop; index: number; event: PhotoEvent & { date: string } }[] {
  return STOPS.flatMap((stop, index) =>
    photosFor(stop.id).events
      .filter((e): e is PhotoEvent & { date: string } => e.timeline && !!e.date)
      .map((event) => ({ stop, index, event }))
  ).sort((a, b) => a.event.date.localeCompare(b.event.date));
}

// Catch typos in photos.json at build time.
for (const id of Object.keys(byStop)) {
  if (!STOPS.some((s) => s.id === id)) throw new Error(`src/data/photos.json has photos for unknown stop "${id}".`);
}
