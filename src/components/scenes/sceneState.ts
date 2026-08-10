import * as THREE from "three";

/**
 * DOM-driven inputs for the WebGL scenes.
 *
 * - Accent: the section accent color, read from the `--section-accent` CSS
 *   variable on <html> (which `morphSectionColors` tweens in OKLCH) via a
 *   MutationObserver, converted to sRGB hex for THREE materials. Scenes read
 *   it every frame so their palette follows the section morph smoothly instead
 *   of snapping to a target color.
 * - Pointer: normalized window mouse position (-1..1). The canvas wrapper has
 *   `pointer-events: none` (so it never blocks the page), which means R3F's
 *   `pointer` never updates — we track the mouse on `window` instead (same
 *   pattern as CursorGlow) and scenes read it from their render loop.
 */

let accentHex = "#00ff9d";
const accentColor = new THREE.Color("#00ff9d");
const pointer = { x: 0, y: 0 };
let observer: MutationObserver | null = null;

/**
 * Parse a CSS oklch() string into 0-1 L and C (hue in degrees). Handles both
 * the percentage form LightningCSS emits in stylesheets ("oklch(87.99% .21
 * 156.86)") and the number form GSAP writes inline at runtime. Alpha is
 * tolerated in either form but discarded — scene colors don't need it.
 */
function parseOklch(value: string): { L: number; C: number; h: number } | null {
  const match = value.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\s*\)/i);
  if (!match) return null;
  // CSS Color 4: L 100% = 1.0, chroma 100% = 0.4.
  const L = parseFloat(match[1]) / (match[1].includes("%") ? 100 : 1);
  const C = parseFloat(match[2]) * (match[2].includes("%") ? 0.4 / 100 : 1);
  return { L, C, h: parseFloat(match[3]) };
}

function linearToSrgb(c: number): number {
  c = Math.min(1, Math.max(0, c));
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** Inverse OKLab/OKLCH -> sRGB (Björn Ottosson's formulas), validated against CSS Color 4. */
function oklchToHex({ L, C, h }: { L: number; C: number; h: number }): string {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const r = linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bv = linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(bv)}`;
}

function sampleAccent(): void {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--section-accent").trim();
  if (!value) return;
  const oklch = parseOklch(value);
  if (oklch) {
    accentHex = oklchToHex(oklch);
    accentColor.set(accentHex);
  } else {
    // Not oklch (e.g. defensive fallback) — let THREE parse the raw value.
    accentColor.set(value);
  }
}

function handlePointerMove(event: MouseEvent): void {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
}

/** Start DOM tracking. Idempotent; call once when the Canvas mounts. */
export function startSceneInputs(): void {
  if (observer) return;
  sampleAccent();
  observer = new MutationObserver(sampleAccent);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
  window.addEventListener("mousemove", handlePointerMove);
}

/** Stop DOM tracking (Canvas unmount). */
export function stopSceneInputs(): void {
  observer?.disconnect();
  observer = null;
  window.removeEventListener("mousemove", handlePointerMove);
}

/** Current accent as an sRGB hex string (cached; no DOM reads). */
export function getSceneAccent(): string {
  return accentHex;
}

/** Copies the current accent into `out` and returns it (no allocation). */
export function setSceneAccent(out: THREE.Color): THREE.Color {
  return out.copy(accentColor);
}

/**
 * Secondary palette color: the accent hue-rotated by -54deg.
 * Keeps multi-color scenes (blobs) harmonious while still following the morph.
 */
export function setSceneSecondaryAccent(out: THREE.Color): THREE.Color {
  return out.copy(accentColor).offsetHSL(-0.15, 0, 0);
}

/** Normalized window pointer (-1..1 each axis). Read-only. */
export function getScenePointer(): { readonly x: number; readonly y: number } {
  return pointer;
}
