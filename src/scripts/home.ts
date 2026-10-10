import { STOPS, directionsUrl, stopUrl } from "../lib/trail";
import { visited, stamp, renderPassport, initMapCaptions } from "./passport";
import { initPhoto } from "./photo";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const sheet = $("sheet"), scrim = $("scrim"), caption = $("mapCaption");
const visitBtn = $<HTMLButtonElement>("visitBtn"), nextBtn = $<HTMLAnchorElement>("nextBtn");
let current = 0;
let lastFocus: HTMLElement | null = null;

const photo = initPhoto(sheet.querySelector<HTMLElement>("[data-photo]")!, {
  currentIndex: () => current,
  onFramed: (i) => { if (stamp(STOPS[i].id)) { renderPassport(); updateVisitBtn(); } },
});

function setActivePin(id: string | null) {
  document.querySelectorAll(".m-pin").forEach((g) => g.classList.toggle("active", (g as SVGElement).dataset.stopId === id));
}

function updateVisitBtn() {
  const v = visited.has(STOPS[current].id);
  visitBtn.textContent = v ? "Visited" : "Mark as visited";
  visitBtn.disabled = v;
}

function openStop(id: string) {
  const i = STOPS.findIndex((s) => s.id === id);
  if (i < 0) return;
  const s = STOPS[i];
  current = i;
  if (!sheet.classList.contains("open")) lastFocus = document.activeElement as HTMLElement;
  $("sheetStop").textContent = `Stop ${i + 1} of ${STOPS.length}. ${s.meta}`;
  $("sheetTitle").textContent = s.name;
  $("sheetWhere").textContent = s.where;
  $("sheetStory").textContent = s.comingSoon ? "This marker's story is coming soon." : s.story;
  $("sheetStory").classList.toggle("coming-soon", !!s.comingSoon);
  document.querySelectorAll<HTMLElement>("[data-photos-for]").forEach((el) => { el.hidden = el.dataset.photosFor !== s.id; });
  const dir = directionsUrl(s), dirLink = $<HTMLAnchorElement>("dirLink");
  dirLink.hidden = !dir;
  if (dir) dirLink.href = dir;
  updateVisitBtn();
  const next = STOPS[i + 1];
  nextBtn.hidden = !next;
  if (next) {
    nextBtn.textContent = `Next stop: ${next.name}`;
    nextBtn.href = stopUrl(next.id);
    nextBtn.dataset.open = next.id;
  }
  photo.reset();
  setActivePin(id);
  caption.textContent = `Stop ${i + 1}: ${s.name}`;
  sheet.classList.add("open"); scrim.classList.add("open"); sheet.setAttribute("aria-hidden", "false");
  sheet.scrollTop = 0;
  $("closeBtn").focus();
}

function closeSheet() {
  sheet.classList.remove("open"); scrim.classList.remove("open"); sheet.setAttribute("aria-hidden", "true");
  setActivePin(null);
  lastFocus?.focus();
}

// Stop links and map pins are real links to /stops/<id>; on this page they open the story sheet instead,
// unless the visitor asked for a new tab or window.
document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element).closest<HTMLElement | SVGAElement>("[data-open], .m-pin");
  if (!link) return;
  const id = link.dataset.open ?? link.dataset.stopId;
  if (!id) return;
  e.preventDefault();
  openStop(id);
});
document.querySelectorAll<SVGAElement>(".m-pin").forEach((pin) => {
  pin.addEventListener("keydown", (e) => { if (e.key === " ") { e.preventDefault(); openStop(pin.dataset.stopId!); } });
});

$("closeBtn").addEventListener("click", closeSheet);
scrim.addEventListener("click", closeSheet);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sheet.classList.contains("open")) closeSheet(); });
visitBtn.addEventListener("click", () => { stamp(STOPS[current].id); renderPassport(); updateVisitBtn(); });

initMapCaptions();
renderPassport();
