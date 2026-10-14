import stopsData from "../data/stops.json";

/** A recorded interview for a stop. Audio files go in public/audio/. */
export interface OralHistory {
  /** Path to the recording, e.g. "/audio/kentwood.mp3". */
  src: string;
  title: string;
  /** Who is speaking, e.g. "Elaine Estes Graham, interviewed in 2026". */
  speaker?: string;
  /** Full transcript; separate paragraphs with a blank line. Required, so the recording is accessible to everyone. */
  transcript: string;
}

export interface Stop {
  id: string;
  name: string;
  where: string;
  meta: string;
  /** null until the marker's location is confirmed; the stop is then left off the map. */
  lat: number | null;
  lng: number | null;
  /** Marker is up but its story hasn't been written yet. */
  comingSoon?: boolean;
  /** Editorial note, e.g. "pending committee confirmation". Not shown on the site. */
  status?: string;
  teaser: string;
  /** Paragraphs are separated by a blank line ("\n\n"). */
  story: string;
  /** Shown on the stop page only when present. */
  oralHistory?: OralHistory;
}
export type MappedStop = Stop & { lat: number; lng: number };

/** Trail order is the order of src/data/stops.json. */
export const STOPS: Stop[] = stopsData;

for (const s of STOPS) {
  const o = s.oralHistory;
  if (o && (!o.src?.trim() || !o.title?.trim() || !o.transcript?.trim()))
    throw new Error(`Stop "${s.id}": an oralHistory entry needs a src, a title and a transcript.`);
}

/** The story split into paragraphs. */
export const storyParagraphs = (s: Stop) => s.story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export const isMapped = (s: Stop): s is MappedStop => s.lat != null && s.lng != null;

export const TRAIL_NAME = "Springfield-Greene County African American Heritage Trail";

export const stopUrl = (id: string) => `/stops/${id}/`;

export const directionsUrl = (s: Stop) =>
  isMapped(s) ? `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=walking` : null;

/** "February 24, 2025" from "2025-02-24", without time-zone drift. */
export const formatDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
/** "eleven" for 11, so page copy follows the data file as stops are added. */
export const countWord = (n: number) => WORDS[n] ?? String(n);
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- map projection (stylized, not to scale) ---------- */
const B = { minLat: 37.1955, maxLat: 37.2405, minLng: -93.2980, maxLng: -93.2700 };
export const MAP_W = 400;
export const MAP_H = Math.round(
  MAP_W * ((B.maxLat - B.minLat) / ((B.maxLng - B.minLng) * Math.cos((37.22 * Math.PI) / 180)))
);
export const px = (lng: number) => 30 + ((lng - B.minLng) / (B.maxLng - B.minLng)) * (MAP_W - 60);
export const py = (lat: number) => 20 + ((B.maxLat - lat) / (B.maxLat - B.minLat)) * (MAP_H - 40);
