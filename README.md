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
