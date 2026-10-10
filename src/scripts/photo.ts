import { STOPS, TRAIL_NAME } from "../lib/trail";

/**
 * The trail photo: a selfie framed with the marker's name.
 * Phones get the native share sheet (which offers "Save Image"); everything else downloads a JPEG.
 */
export function initPhoto(root: HTMLElement, opts: { currentIndex: () => number; onFramed: (index: number) => void }) {
  const input = root.querySelector<HTMLInputElement>("[data-photo-input]")!;
  const panel = root.querySelector<HTMLElement>("[data-photo-panel]")!;
  const canvas = root.querySelector<HTMLCanvasElement>("[data-photo-canvas]")!;
  const saveBtn = root.querySelector<HTMLButtonElement>("[data-photo-save]")!;
  const note = root.querySelector<HTMLElement>("[data-photo-note]")!;
  const ctx = canvas.getContext("2d")!;
  let framedIndex = -1;

  function wrapText(text: string, x: number, y: number, maxW: number, lh: number) {
    const lines: string[] = [];
    let line = "";
    for (const w of text.split(" ")) {
      const t = line ? line + " " + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
    return lines.length;
  }

  async function frame(file: File) {
    const index = opts.currentIndex();
    const s = STOPS[index];
    const url = URL.createObjectURL(file);
    const img = new Image();
    try {
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    } finally {
      URL.revokeObjectURL(url);
    }
    try {
      await Promise.all([
        document.fonts.load("800 72px Bitter"),
        document.fonts.load("600 34px 'Public Sans'"),
        document.fonts.load("400 30px 'Public Sans'"),
      ]);
    } catch {}

    const Wc = 1080, Hc = 1350, band = 360;
    ctx.fillStyle = "#12352B"; ctx.fillRect(0, 0, Wc, Hc);
    const ph = Hc - band, r = Math.max(Wc / img.width, ph / img.height), w = img.width * r, h = img.height * r;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Wc, ph); ctx.clip();
    ctx.drawImage(img, (Wc - w) / 2, (ph - h) / 2, w, h); ctx.restore();
    ctx.fillStyle = "#B8901E"; ctx.fillRect(0, ph, Wc, 10);
    ctx.strokeStyle = "#B8901E"; ctx.lineWidth = 14; ctx.strokeRect(7, 7, Wc - 14, Hc - 14);
    ctx.fillStyle = "#E7D49A"; ctx.font = "600 34px 'Public Sans', Arial, sans-serif";
    ctx.fillText(`I walked the trail. Stop ${index + 1} of ${STOPS.length}`, 64, ph + 78);
    ctx.fillStyle = "#F4EFE0"; ctx.font = "800 72px Bitter, Georgia, serif";
    const n = wrapText(s.name, 64, ph + 160, Wc - 128, 78);
    ctx.fillStyle = "#B9C4BD"; ctx.font = "400 30px 'Public Sans', Arial, sans-serif";
    ctx.fillText(TRAIL_NAME, 64, Math.min(ph + 160 + n * 78 + 16, Hc - 48));

    framedIndex = index;
    panel.classList.add("show");
    note.textContent = "";
    canvas.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    opts.onFramed(index);
  }

  input.addEventListener("change", () => {
    const f = input.files && input.files[0];
    if (f) frame(f).catch(() => { panel.classList.add("show"); note.textContent = "That photo couldn't be opened. Try taking it again."; });
    input.value = "";
  });

  saveBtn.addEventListener("click", () => {
    canvas.toBlob(async (blob) => {
      if (!blob) { note.textContent = "That photo couldn't be saved. Try taking it again."; return; }
      const name = `heritage-trail-${STOPS[framedIndex].id}.jpg`;
      const file = new File([blob], name, { type: "image/jpeg" });

      // On phones, the share sheet is how people save to their photos or post it.
      if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "My Heritage Trail photo" });
          note.textContent = "";
          return;
        } catch (err) {
          if ((err as DOMException)?.name === "AbortError") return; // visitor closed the sheet
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      note.textContent = `Saved as ${name} in your downloads.`;
    }, "image/jpeg", 0.92);
  });

  return {
    reset() { panel.classList.remove("show"); note.textContent = ""; framedIndex = -1; },
  };
}
