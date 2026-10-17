import { useEffect, useState } from "react";

/**
 * Adaptive performance mode.
 *
 * Auto-enables when:
 *   1. The device reports low memory / few cores (upfront signal), OR
 *   2. The rolling FPS measurement drops below the threshold for a sustained
 *      window (runtime signal).
 *
 * Once enabled it sticks — the heavy features (WebGL canvas, Lenis smooth
 * scroll, backdrop blur) are gated off, and re-enabling them mid-session
 * would require rebuilding the R3F scene and re-mounting Lenis, which is
 * more disruptive than helpful.
 *
 * Also surfaces a `data-perf="low|high"` attribute on <html> so CSS can
 * drop expensive effects (backdrop-filter, etc.) without re-rendering.
 */

type Mode = "high" | "low";

let currentMode: Mode = "high";
const subscribers = new Set<(mode: Mode) => void>();
let monitorStarted = false;
let rafId: number | null = null;

const FPS_SAMPLE_WINDOW_MS = 1000;
const FPS_LOW_THRESHOLD = 42;
const FPS_LOW_DWELL_MS = 2000;

export function getPerfMode(): Mode {
  return currentMode;
}

export function isPerfLow(): boolean {
  return currentMode === "low";
}

function setMode(next: Mode) {
  if (next === currentMode) return;
  currentMode = next;
  if (typeof document !== "undefined") {
    document.documentElement.dataset.perf = next;
  }
  subscribers.forEach((cb) => cb(next));
}

/**
 * Lightweight device-capability heuristic. These APIs are intentionally fuzzy
 * (browsers may round or refuse to report), so we OR a couple of signals and
 * err on the side of staying high-perf unless something concrete suggests
 * otherwise.
 */
function looksLowEndFromDeviceCaps(): boolean {
  if (typeof navigator === "undefined") return false;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  // Don't trust deviceMemory on Safari (it reports 8GB even on 4GB iPads).
  const isSafari =
    typeof navigator.userAgent === "string" &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrome\//.test(navigator.userAgent);
  if (!isSafari && typeof mem === "number" && mem > 0 && mem <= 2) return true;
  if (typeof cores === "number" && cores > 0 && cores <= 2) return true;
  return false;
}

function startMonitor() {
  if (monitorStarted || typeof window === "undefined") return;
  monitorStarted = true;
  // Side-effect: ensure the data-perf attribute is present from first paint
  // so CSS hooks fire before any perf-low state is reached.
  if (typeof document !== "undefined" && !document.documentElement.dataset.perf) {
    document.documentElement.dataset.perf = "high";
  }

  // Upfront: if the device looks low-end, skip the canvas immediately rather
  // than waiting for a poor-FPS reading that the canvas itself is causing.
  if (looksLowEndFromDeviceCaps()) {
    setMode("low");
  }

  let frames = 0;
  let windowStart = performance.now();
  let lowDwellStart: number | null = null;

  const tick = (now: number) => {
    frames += 1;
    if (now - windowStart >= FPS_SAMPLE_WINDOW_MS) {
      const fps = (frames * 1000) / (now - windowStart);
      frames = 0;
      windowStart = now;

      if (currentMode === "high") {
        if (fps < FPS_LOW_THRESHOLD) {
          if (lowDwellStart === null) lowDwellStart = now;
          if (now - lowDwellStart >= FPS_LOW_DWELL_MS) {
            setMode("low");
          }
        } else {
          lowDwellStart = null;
        }
      }
      // No recovery path: once low, stay low for the rest of the session.
    }
    rafId = window.requestAnimationFrame(tick);
  };

  rafId = window.requestAnimationFrame(tick);
}

export function stopMonitor() {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
  monitorStarted = false;
}

export { startMonitor as startPerfMonitor, stopMonitor as stopPerfMonitor };

/** React hook that subscribes to perf-mode changes. */
export function usePerfMode(): Mode {
  const [mode, setModeState] = useState<Mode>(currentMode);
  useEffect(() => {
    const cb = (m: Mode) => setModeState(m);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);
  return mode;
}