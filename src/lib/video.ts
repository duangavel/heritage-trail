/** Video hosts the site can embed. Nothing loads from either until the visitor taps play. */
export type VideoProvider = "youtube" | "vimeo";

export const PROVIDERS: Record<VideoProvider, {
  name: string;
  validId: (id: string) => boolean;
  watchUrl: (id: string) => string;
  /** Privacy-friendly player: youtube-nocookie.com, or Vimeo with Do Not Track. */
  embedUrl: (id: string) => string;
}> = {
  youtube: {
    name: "YouTube",
    validId: (id) => /^[A-Za-z0-9_-]{11}$/.test(id),
    watchUrl: (id) => `https://www.youtube.com/watch?v=${id}`,
    embedUrl: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
  },
  vimeo: {
    name: "Vimeo",
    validId: (id) => /^\d{6,12}$/.test(id),
    watchUrl: (id) => `https://vimeo.com/${id}`,
    embedUrl: (id) => `https://player.vimeo.com/video/${id}?dnt=1&autoplay=1`,
  },
};

/** A video shown on a stop page, e.g. a dedication or ceremony. */
export interface StopVideo {
  provider: VideoProvider;
  id: string;
  title: string;
  /** Short written description, so the page tells the story without the video. */
  summary: string;
  /** YYYY-MM-DD the video was published, if known. */
  date?: string;
  credit?: string;
}
