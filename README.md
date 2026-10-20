# Springfield-Greene County African American Heritage Trail

The website for the trail, designed and donated by the Gavel family. Built with [Astro](https://astro.build) as a static site.

## Editing stop stories

All stop text lives in [`src/data/stops.json`](src/data/stops.json). Each stop has:

| Field    | What it is                                                      |
| -------- | --------------------------------------------------------------- |
| `id`     | Short name used in the stop's web address: `/stops/<id>`. Printed QR codes point here, so don't change an `id` once its marker is up. |
| `name`   | Marker title                                                    |
| `where`  | Location line                                                   |
| `meta`   | Marker number / dedication line                                 |
| `lat`, `lng` | Position, used for the map and "Get directions"             |
| `teaser` | One sentence shown in the list (also the page's search description) |
| `story`  | The full marker story. Separate paragraphs with a blank line (`\n\n` in the JSON). |
| `status` | Optional editorial note such as `"pending committee confirmation"`; not shown on the site. |

Stops are numbered in the order they appear in the file. Adding or removing an entry updates the map, list, page count and stop pages automatically.

## Other editable content

- **Introduction** (home page, "About the trail"): [`src/data/intro.json`](src/data/intro.json). Currently a draft for Dr. Lyle Foster to revise; replace the `paragraphs` and remove `status` when final.
- **Testimonials**: [`src/data/testimonials.json`](src/data/testimonials.json), a list of `{ "quote": "...", "name": "...", "role": "..." }` (`role` is optional). The home page section stays hidden while the list is empty.
- **Oral histories**: add an `oralHistories` list to the stop in `stops.json`. Stops without one show no player. Each entry is either
  - a YouTube video: `{ "type": "video", "youtubeId": "vv-3WNgwdMc", "title": "...", "speaker": "...", "summary": "...", "credit": "...", "pageUrl": "..." }`. A short summary is required (YouTube provides captions). Nothing loads from YouTube until the visitor taps play, and then it uses youtube-nocookie.com.
  - an audio file in `public/audio/`: `{ "type": "audio", "src": "/audio/kentwood.mp3", "title": "...", "speaker": "...", "transcript": "...", "credit": "..." }`. A full transcript is required.
- **Voices of the trail** (home page): [`src/data/voices.json`](src/data/voices.json), a list of oral histories in the same format, for interviews about the whole trail rather than one stop. The section stays hidden while the list is empty.
- **In the news**: [`src/data/press.json`](src/data/press.json). Each item has `outlet`, `headline`, `date` (YYYY-MM-DD, or null with a `dateLabel`), `url` and `stops` (stop ids and/or `"trail"`). Optional: `links` (several labeled links for one story, e.g. an article and its video) and `stopLinks` (for a series, the page about each stop, shown on that stop instead of the main link). The About page lists every item newest first; each stop page lists the items tagged with that stop. Both lists hide when empty.
- **Advisory Board**: [`src/data/board.json`](src/data/board.json).
- **Donate link**: `DONATE_URL` in [`src/config.ts`](src/config.ts).
- **Places still to be marked** (shown in the donation panel): [`src/data/next-markers.json`](src/data/next-markers.json).

## QR codes

Each marker's QR code should link to its stop page, for example `https://<site>/stops/kentwood`.
Opening a stop page from a QR code (or any link from outside the site) welcomes the visitor and stamps their trail passport.
Older links in the form `/?stop=kentwood` still work and redirect to the stop page.

## Launch day

Until launch the site asks search engines not to list it (a `noindex` tag on every page and a `robots.txt` that blocks crawling).
To open it up, set `HIDE_FROM_SEARCH_ENGINES = false` in [`src/config.ts`](src/config.ts), then commit and push.

## Running it

```sh
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # static site written to dist/
npm run preview  # serve the built site
```
