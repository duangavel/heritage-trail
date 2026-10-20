import pressData from "../data/press.json";
import { STOPS, formatDate } from "./trail";

interface PressLink { label: string; url: string }
interface StopLink { headline: string; url: string; date: string | null }

/** One article, video or series about the trail, from src/data/press.json. */
export interface PressItem {
  outlet: string;
  headline: string;
  /** YYYY-MM-DD, or null when the page has no publication date. */
  date: string | null;
  /** Shown instead of the date, e.g. "Series, December 13–17, 2021". */
  dateLabel?: string;
  /** Main link. When "links" is set, the headline is plain text and those links show instead. */
  url: string;
  /** Several links for one story, e.g. [{ "label": "Read the article", ... }, { "label": "Watch the video", ... }]. */
  links?: PressLink[];
  /** Stop ids this item is about, and/or "trail" for coverage of the trail in general. */
  stops: string[];
  /** For a series: the page about one stop, used on that stop's page instead of the main link. */
  stopLinks?: Record<string, StopLink>;
}

const items = pressData as PressItem[];

// Catch typos in press.json at build time.
const ids = new Set(["trail", ...STOPS.map((s) => s.id)]);
const isUrl = (u: unknown) => typeof u === "string" && /^https?:\/\//.test(u);
const isDate = (d: unknown) => d === null || (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d));
for (const p of items) {
  const name = `src/data/press.json: "${p.headline ?? p.url}"`;
  if (!p.outlet?.trim() || !p.headline?.trim() || !isUrl(p.url)) throw new Error(`${name} needs an outlet, a headline and a full url.`);
  if (!isDate(p.date)) throw new Error(`${name} has date "${p.date}"; use YYYY-MM-DD or null.`);
  for (const s of p.stops ?? []) if (!ids.has(s)) throw new Error(`${name} is tagged with unknown stop "${s}".`);
  for (const l of p.links ?? []) if (!l.label?.trim() || !isUrl(l.url)) throw new Error(`${name} has a link without a label or full url.`);
  for (const [s, l] of Object.entries(p.stopLinks ?? {})) {
    if (!p.stops.includes(s)) throw new Error(`${name} has a stopLinks entry for "${s}", which it isn't tagged with.`);
    if (!l.headline?.trim() || !isUrl(l.url) || !isDate(l.date)) throw new Error(`${name}: stopLinks "${s}" needs a headline, a full url and a YYYY-MM-DD date.`);
  }
}

const byDate = (a: { date: string | null }, b: { date: string | null }) => (b.date ?? "").localeCompare(a.date ?? "");

/** Every item, newest first; undated items last. */
export const allPress = () => [...items].sort(byDate);

/** Items tagged with a stop, newest first, using a series' own page for that stop when it has one. */
export const pressFor = (stopId: string): PressItem[] =>
  items
    .filter((p) => p.stops.includes(stopId))
    .map((p) => {
      const own = p.stopLinks?.[stopId];
      return own ? { ...p, headline: own.headline, url: own.url, date: own.date, dateLabel: undefined, links: undefined } : p;
    })
    .sort(byDate);

export const pressDate = (p: PressItem) => p.dateLabel ?? (p.date ? formatDate(p.date) : "");
