import { STOPS } from "../lib/trail";
import { visited, stamp, renderPassport, initMapCaptions } from "./passport";
import { initPhoto } from "./photo";

const page = document.querySelector<HTMLElement>("[data-stop]")!;
const index = Number(page.dataset.index);
const s = STOPS[index];
const visitBtn = document.getElementById("visitBtn") as HTMLButtonElement;

function updateVisitBtn() {
  const v = visited.has(s.id);
  visitBtn.textContent = v ? "Visited" : "Mark as visited";
  visitBtn.disabled = v;
}

/*
 * A QR scan lands here from outside the site (no referrer from this site), or with ?scan from the demo
 * links on the home page. Either way, welcome the visitor and stamp their passport.
 */
const params = new URLSearchParams(location.search);
let fromThisSite = false;
try { fromThisSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch {}
if (params.has("scan") || !fromThisSite) {
  stamp(s.id);
  const here = document.getElementById("here")!;
  here.textContent = `Welcome to stop ${index + 1}. You're standing at ${s.name}, and it's stamped in your trail passport.`;
  here.classList.add("show");
  if (params.has("scan")) history.replaceState(null, "", location.pathname + location.hash);
}

initPhoto(page.querySelector<HTMLElement>("[data-photo]")!, {
  currentIndex: () => index,
  onFramed: () => { stamp(s.id); renderPassport(); updateVisitBtn(); },
});
visitBtn.addEventListener("click", () => { stamp(s.id); renderPassport(); updateVisitBtn(); });

initMapCaptions();
updateVisitBtn();
renderPassport();
