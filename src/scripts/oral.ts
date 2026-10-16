/* Accessible play/pause and seek controls for oral-history recordings. */
const fmt = (s: number) => {
  if (!isFinite(s)) return "–:––";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

document.querySelectorAll<HTMLElement>("[data-oral]").forEach((root) => {
  const audio = root.querySelector<HTMLAudioElement>("[data-oral-audio]")!;
  const player = root.querySelector<HTMLElement>("[data-oral-player]")!;
  const toggle = root.querySelector<HTMLButtonElement>("[data-oral-toggle]")!;
  const seek = root.querySelector<HTMLInputElement>("[data-oral-seek]")!;
  const current = root.querySelector<HTMLElement>("[data-oral-current]")!;
  const duration = root.querySelector<HTMLElement>("[data-oral-duration]")!;

  audio.controls = false;
  player.hidden = false;

  const sync = () => {
    const playing = !audio.paused;
    toggle.classList.toggle("playing", playing);
    toggle.setAttribute("aria-label", playing ? "Pause recording" : "Play recording");
    current.textContent = fmt(audio.currentTime);
    seek.value = String(Math.floor(audio.currentTime));
    seek.setAttribute("aria-valuetext", `${fmt(audio.currentTime)} of ${fmt(audio.duration)}`);
  };
  const setDuration = () => {
    if (!isFinite(audio.duration)) return;
    seek.max = String(Math.floor(audio.duration));
    duration.textContent = fmt(audio.duration);
    sync();
  };

  toggle.addEventListener("click", () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); });
  seek.addEventListener("input", () => { audio.currentTime = Number(seek.value); sync(); });
  audio.addEventListener("loadedmetadata", setDuration);
  audio.addEventListener("durationchange", setDuration);
  for (const ev of ["play", "pause", "timeupdate", "ended"]) audio.addEventListener(ev, sync);
  if (audio.readyState >= 1) setDuration();
});

/* YouTube: swap the play link for a privacy-enhanced embed only when the visitor asks for it. */
document.querySelectorAll<HTMLElement>("[data-yt]").forEach((box) => {
  const start = box.querySelector<HTMLAnchorElement>("[data-yt-start]")!;
  start.addEventListener("click", (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(box.dataset.yt!)}?autoplay=1&rel=0`;
    iframe.title = `Video: ${box.dataset.ytTitle}`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    box.replaceChildren(iframe);
    box.classList.add("playing");
    iframe.focus();
  });
});
