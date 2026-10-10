import { STOPS } from "../lib/trail";

/** The trail passport: which stops this visitor has been to, kept in their browser. */
const LS_KEY = "aaht-visited";

export const visited = new Set<string>();
try {
  for (const id of JSON.parse(localStorage.getItem(LS_KEY) || "[]")) visited.add(id);
} catch {}

export function stamp(id: string) {
  if (visited.has(id)) return false;
  visited.add(id);
  try { localStorage.setItem(LS_KEY, JSON.stringify([...visited])); } catch {}
  return true;
}

/** Refresh every passport-dependent element on the page. */
export function renderPassport() {
  document.querySelectorAll<HTMLElement>("[data-stop-id]").forEach((el) => {
    el.classList.toggle("visited", visited.has(el.dataset.stopId!));
  });
  document.querySelectorAll<HTMLElement>("[data-visited-suffix]").forEach((el) => {
    el.textContent = visited.has(el.dataset.visitedSuffix!) ? " (visited)" : "";
  });
  const n = visited.size;
  document.querySelectorAll<HTMLElement>("[data-passport]").forEach((el) => {
    el.innerHTML = n
      ? `Your trail passport: <strong>${n} of ${STOPS.length}</strong> stops visited.`
      : "Your trail passport fills in as you visit stops.";
  });
}

/** Hover/focus captions under the map. */
export function initMapCaptions() {
  const caption = document.getElementById("mapCaption");
  if (!caption) return;
  document.querySelectorAll<SVGAElement>(".m-pin").forEach((pin) => {
    const show = () => { caption.textContent = pin.getAttribute("aria-label"); };
    pin.addEventListener("mouseenter", show);
    pin.addEventListener("focus", show);
  });
}
