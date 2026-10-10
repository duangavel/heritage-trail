/* Tap-to-enlarge photo viewer. Without JavaScript, gallery links simply open the large image. */
const dialog = document.getElementById("viewer") as HTMLDialogElement | null;

if (dialog) {
  const img = document.getElementById("viewerImg") as HTMLImageElement;
  const caption = document.getElementById("viewerCaption")!;
  const count = document.getElementById("viewerCount")!;
  let items: HTMLAnchorElement[] = [];
  let index = 0;
  let opener: HTMLElement | null = null;

  function show(i: number) {
    index = (i + items.length) % items.length;
    const a = items[index];
    img.src = a.href;
    img.alt = a.dataset.alt ?? "";
    img.width = Number(a.dataset.fullW);
    img.height = Number(a.dataset.fullH);
    caption.textContent = a.dataset.caption ?? "";
    count.textContent = items.length > 1 ? `${index + 1} of ${items.length}` : "";
    // warm the next photo so swiping feels instant
    const next = items[(index + 1) % items.length];
    if (next) new Image().src = next.href;
  }

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest<HTMLAnchorElement>("[data-gallery] a");
    if (!a) return;
    e.preventDefault();
    items = [...a.closest("[data-gallery]")!.querySelectorAll<HTMLAnchorElement>("a")];
    opener = a;
    show(items.indexOf(a));
    dialog.showModal();
  });

  dialog.addEventListener("click", (e) => {
    const action = (e.target as HTMLElement).closest<HTMLElement>("[data-viewer]")?.dataset.viewer;
    if (action === "close" || e.target === dialog) dialog.close();
    else if (action === "prev") show(index - 1);
    else if (action === "next") show(index + 1);
  });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
  });
  dialog.addEventListener("close", () => { img.removeAttribute("src"); opener?.focus(); });

  // swipe left/right on phones
  let startX = 0, startY = 0;
  dialog.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
  dialog.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX, dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
  });
}
