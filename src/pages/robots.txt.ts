import type { APIRoute } from "astro";
import { HIDE_FROM_SEARCH_ENGINES } from "../config";

/* Built to /robots.txt; controlled by the launch switch in src/config.ts. */
export const GET: APIRoute = () =>
  new Response(HIDE_FROM_SEARCH_ENGINES ? "User-agent: *\nDisallow: /\n" : "User-agent: *\nAllow: /\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
