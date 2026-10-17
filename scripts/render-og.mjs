// Renders scripts/og-card.html to public/images/og.png at the exact 1200x630
// size declared by the og:image meta tags in index.html.
//
// Run with: npm run og:image   (uses the already-installed `playwright` devDep)
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "scripts", "og-card.html");
const output = path.join(root, "public", "images", "og.png");

const FONT_FAMILIES = ["Space Grotesk", "Fraunces", "JetBrains Mono"];

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  const fontResponses = [];
  page.on("response", (res) => {
    if (res.url().includes("fonts.gstatic.com")) fontResponses.push(res.status());
  });

  await page.goto(`file://${source}`, { waitUntil: "networkidle" });

  // The Google Fonts CSS uses `display=swap`, so fallbacks paint first and
  // `document.fonts.ready` alone can race. Force-load each family, then fail
  // loudly if any is missing rather than silently shipping a fallback-font card.
  const missing = await page.evaluate(async (families) => {
    await Promise.all(families.map((f) => document.fonts.load(`16px "${f}"`)));
    await document.fonts.ready;
    return families.filter((f) => !document.fonts.check(`16px "${f}"`));
  }, FONT_FAMILIES);

  if (missing.length > 0) {
    throw new Error(`Web fonts did not load: ${missing.join(", ")}`);
  }

  await page.screenshot({ path: output, type: "png" });
  console.log(`wrote ${path.relative(root, output)} (1200x630)`);
  console.log(
    `web font files fetched: ${fontResponses.length} (statuses: ${[...new Set(fontResponses)].join(",") || "none"})`,
  );
} finally {
  await browser.close();
}
