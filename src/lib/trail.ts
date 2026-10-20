import stopsData from "../data/stops.json";
import { PROVIDERS, type StopVideo, type VideoProvider } from "./video";

interface OralHistoryBase {
  title: string;
  /** Who is speaking, e.g. "Richard Lewis". */
  speaker?: string;
  /** Shown under each recording, e.g. "From The Journey Continues, Missouri State University". */
  credit?: string;
  /** A page with more about this person or recording. */
  pageUrl?: string;
}
/** An audio recording. Files go in public/audio/. */
export interface AudioOralHistory extends OralHistoryBase {
  type: "audio";
  /** Path to the recording, e.g. "/audio/kentwood.mp3". */
  src: string;
  /** Full transcript; separate paragraphs with a blank line. Required, so the recording is accessible to everyone. */
  transcript: string;
}
/** A video interview on YouTube or Vimeo, embedded only after the visitor taps play. Give exactly one ID. */
export interface VideoOralHistory extends OralHistoryBase {
  type: "video";
  /** The 11-character ID from the YouTube link, e.g. "vv-3WNgwdMc". */
  youtubeId?: string;
  /** The number from the Vimeo link, e.g. "460197558". */
  vimeoId?: string;
  speaker: string;
  /** Short written summary (YouTube provides captions for the full video). */
  summary: string;
}
export type OralHistory = AudioOralHistory | VideoOralHistory;

/** Which host a video oral history is on. */
export const oralVideo = (o: VideoOralHistory): { provider: VideoProvider; id: string } =>
  o.vimeoId ? { provider: "vimeo", id: o.vimeoId } : { provider: "youtube", id: o.youtubeId ?? "" };

/** An extra section of text on a stop page, e.g. the back of a marker. */
export interface StopSection {
  title: string;
  /** Small line above the title, e.g. "Marker, side B · Equal Justice Initiative, 2019". */
  kicker?: string;
  /** Paragraphs separated by a blank line. */
  text: string;
  /** Editorial note; not shown on the site. */
  status?: string;
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
  /** Extra sections shown after the story, e.g. the back of the marker. */
  sections?: StopSection[];
  /** Videos about this stop (ceremonies, dedications); shown only when there is at least one. */
  videos?: StopVideo[];
  /** Oral histories for this stop; the section is shown only when there is at least one. */
  oralHistories?: OralHistory[];
}
export type MappedStop = Stop & { lat: number; lng: number };

/** Trail order is the order of src/data/stops.json. */
export const STOPS: Stop[] = stopsData as Stop[];

const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;
/** Fails the build if an oral history is missing what makes it accessible. */
export function checkOralHistories(list: OralHistory[], where: string) {
  for (const o of list) {
    const ok = !filled(o.title) ? false
      : o.type === "audio" ? filled(o.src) && filled(o.transcript)
      : o.type === "video" ? !!o.youtubeId !== !!o.vimeoId && PROVIDERS[oralVideo(o).provider].validId(oralVideo(o).id) && filled(o.speaker) && filled(o.summary)
      : false;
    if (!ok) throw new Error(`${where}: each oral history needs a title plus, for "audio", a src and a full transcript, or for "video", one youtubeId or vimeoId, a speaker and a summary.`);
  }
}
for (const s of STOPS) {
  checkOralHistories(s.oralHistories ?? [], `Stop "${s.id}"`);
  for (const v of s.videos ?? []) {
    if (!PROVIDERS[v.provider]?.validId(v.id) || !filled(v.title) || !filled(v.summary))
      throw new Error(`Stop "${s.id}": each video needs a provider ("youtube" or "vimeo"), a valid id, a title and a summary.`);
  }
  for (const sec of s.sections ?? []) {
    if (!filled(sec.title) || !filled(sec.text)) throw new Error(`Stop "${s.id}": each section needs a title and text.`);
  }
}

/** Text split into paragraphs at blank lines. */
export const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
/** The story split into paragraphs. */
export const storyParagraphs = (s: Stop) => paragraphs(s.story);

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
// Downtown and midtown (west of CORE_EAST) are drawn to scale across most of the width. East of that,
// the empty stretch out to Lincoln Memorial Cemetery (Chestnut Expressway and Barnes Avenue) is
// compressed into the last strip, so the downtown pins stay readable.
const B = { minLat: 37.1955, maxLat: 37.2330, minLng: -93.2980, maxLng: -93.2470 };
const CORE_EAST = -93.2700;
const CORE_SHARE = 0.84;
export const MAP_W = 400;
const INNER_W = MAP_W - 60;
export const MAP_H = Math.round(
  INNER_W * CORE_SHARE * ((B.maxLat - B.minLat) / ((CORE_EAST - B.minLng) * Math.cos((37.22 * Math.PI) / 180))) + 40
);
export const px = (lng: number) =>
  lng <= CORE_EAST
    ? 30 + ((lng - B.minLng) / (CORE_EAST - B.minLng)) * INNER_W * CORE_SHARE
    : 30 + INNER_W * CORE_SHARE + ((lng - CORE_EAST) / (B.maxLng - CORE_EAST)) * INNER_W * (1 - CORE_SHARE);
export const py = (lat: number) => 20 + ((B.maxLat - lat) / (B.maxLat - B.minLat)) * (MAP_H - 40);
