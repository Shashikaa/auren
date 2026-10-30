import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  for (const width of [1440, 375]) {
    await page.setViewport({ width, height: 900 });
    for (const route of ["builds", "stock", "contact"]) {
      await page.goto(`${base}/${route}`, { waitUntil: "networkidle0" });
      await page.evaluate(() => document.fonts.ready);
      const titles = await page.$$eval("main h1,main h2,main h3", (els) =>
        els.map((el) => ({
          id: el.id,
          text: el.getAttribute("aria-label"),
          lines: el.querySelectorAll(".rise-line").length,
          chars: el.querySelectorAll(".rise-char").length,
        })),
      );
      assert.ok(titles.length > 1);
      assert.ok(
        titles.every((t) => t.lines > 0 && t.chars > 0 && t.text),
        `${route} at ${width}px must use Home's line/character title reveal: ${JSON.stringify(titles)}`,
      );
      for (let i = 0; i < titles.length; i++) {
        await page.$$eval(
          "main h1,main h2,main h3",
          (els, i) =>
            els[i].scrollIntoView({ block: "center", behavior: "instant" }),
          i,
        );
        await new Promise((r) => setTimeout(r, 2800));
        const state = await page.$$eval(
          "main h1,main h2,main h3",
          (els, i) => ({
            revealed: els[i].dataset.revealed,
            filled: !!els[i].querySelector(".rise-fill"),
            visible: getComputedStyle(els[i]).opacity,
          }),
          i,
        );
        assert.equal(state.revealed, "true");
        assert.equal(state.filled, true);
        assert.equal(state.visible, "1");
      }
      console.log(`PASS ${route} headings at ${width}px: ${titles.length}`);
    }
  }
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.goto(`${base}/contact`, { waitUntil: "networkidle0" });
  assert.equal(
    await page.$$eval("main h1,main h2,main h3", (els) =>
      els.every(
        (el) =>
          getComputedStyle(el).opacity === "1" &&
          el.textContent.trim().length > 0,
      ),
    ),
    true,
  );
  assert.deepEqual(errors, []);
  console.log("Heading reveal checks passed");
} finally {
  await browser.close();
}
