import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const out =
  process.env.HERMES_SCRATCH_DIR ||
  `${process.env.USERPROFILE}/AppData/Local/hermes/cache/scratch`;
const artifacts = `${out}/auren-motion-qa`;
mkdirSync(artifacts, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const errors = [],
  report = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function go(route) {
  const response = await page.goto(`${base}/${route}`, {
    waitUntil: "networkidle0",
  });
  assert.equal(response.status(), 200);
}
async function move(sectionSelector, ratio, targetSelector) {
  return page.evaluate(
    async ({ sectionSelector, ratio, targetSelector }) => {
      const section = document.querySelector(sectionSelector);
      const top = section.getBoundingClientRect().top + scrollY;
      scrollTo({
        top: top + (section.offsetHeight - innerHeight) * ratio,
        behavior: "instant",
      });
      await new Promise((r) => setTimeout(r, 150));
      const target = document.querySelector(targetSelector);
      return {
        transform: getComputedStyle(target).transform,
        top: target.getBoundingClientRect().top,
        y: scrollY,
      };
    },
    { sectionSelector, ratio, targetSelector },
  );
}
try {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await go("builds");
  assert.equal(
    await page.evaluate(
      async () =>
        typeof (await import("/scripts/inner-pages.js")).setupInnerPage,
    ),
    "function",
    "runtime must expose repeatable initialization instead of a once-only script",
  );
  for (const route of ["builds", "stock", "contact"]) {
    await go(route);
    await page.waitForFunction(
      () =>
        document.querySelector("[data-motion-page]")?.dataset.motionReady ===
        "true",
    );
    const heroStart = await page.$eval(
      ".inner-hero__media img",
      (n) => getComputedStyle(n).transform,
    );
    await page.evaluate(() => scrollTo({ top: 300, behavior: "instant" }));
    await wait(200);
    const heroLater = await page.$eval(
      ".inner-hero__media img",
      (n) => getComputedStyle(n).transform,
    );
    assert.notEqual(
      heroStart,
      heroLater,
      `${route} hero should scrub with scroll`,
    );
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 45));
      }
    });
    await wait(800);
    const metrics = await page.evaluate(() => ({
      overflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      brokenImages: [...document.images]
        .filter((i) => !i.complete || !i.naturalWidth)
        .map((i) => i.src),
      hiddenReveals: [...document.querySelectorAll("[data-reveal]")].filter(
        (e) => +getComputedStyle(e).opacity < 0.99,
      ).length,
    }));
    assert.equal(metrics.overflow, 0, `${route} desktop overflow`);
    assert.deepEqual(metrics.brokenImages, [], `${route} broken media`);
    assert.equal(metrics.hiddenReveals, 0, `${route} content should reveal`);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await wait(250);
    await page.screenshot({ path: `${artifacts}/${route}-desktop.png` });
    await page.click("#menu-toggle");
    assert.equal(await page.$eval("#menu", (e) => e.inert), false);
    await page.keyboard.press("Escape");
    assert.equal(await page.$eval("#menu", (e) => e.inert), true);
    // Exercise setup/cleanup repeatedly on live DOM (same module cache).
    const lifecycle = await page.evaluate(async () => {
      const { setupInnerPage } = await import("/scripts/inner-pages.js");
      const main = document.querySelector("[data-motion-page]");
      const stop1 = setupInnerPage(main);
      stop1();
      const stop2 = setupInnerPage(main);
      stop2();
      const stop3 = setupInnerPage(main);
      document.querySelector("#menu-toggle").click();
      const open = document
        .querySelector("#menu-toggle")
        .getAttribute("aria-expanded");
      document.querySelector("#menu-toggle").click();
      const closed = document
        .querySelector("#menu-toggle")
        .getAttribute("aria-expanded");
      stop3();
      setupInnerPage(main);
      return { open, closed };
    });
    assert.deepEqual(
      lifecycle,
      { open: "true", closed: "false" },
      `${route} remount must not duplicate listeners`,
    );
    report.push({ route, desktop: metrics, lifecycle });
  }
  for (const [route, section, target] of [
    ["builds", ".build-film", ".build-film__track"],
    ["stock", ".stock-stage", ".stock-vehicle--1"],
  ]) {
    await go(route);
    const early = await move(section, 0.12, target),
      late = await move(section, 0.88, target),
      reversed = await move(section, 0.12, target);
    assert.notEqual(
      early.transform,
      late.transform,
      `${route} scroll scene must move`,
    );
    assert.equal(
      early.transform,
      reversed.transform,
      `${route} scroll scene must reverse deterministically`,
    );
    const sticky = await page.$eval(`${section} > div`, (e) => ({
      position: getComputedStyle(e).position,
      top: e.getBoundingClientRect().top,
    }));
    assert.equal(sticky.position, "sticky");
    assert.ok(
      Math.abs(sticky.top) < 4,
      `${route} scene must stay pinned, got ${sticky.top}`,
    );
    await move(section, 0.6, target);
    await page.screenshot({ path: `${artifacts}/${route}-scene.png` });
    report.push({ route, early, late, reversed, sticky });
  }
  await go("contact");
  await page.click("[data-focus-form]");
  await wait(1100);
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "build-name",
  );
  await page.click("#build-form button[type=submit]");
  assert.match(
    await page.$eval("#build-form-status", (e) => e.textContent),
    /Complete each field/,
  );
  const form = await page.$eval("#build-form", (e) => ({
    height: e.getBoundingClientRect().height,
    opacity: getComputedStyle(e).opacity,
  }));
  assert.equal(form.opacity, "1");
  await page.screenshot({ path: `${artifacts}/contact-form.png` });
  for (const width of [375, 768, 1024]) {
    await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
    for (const route of ["builds", "stock", "contact"]) {
      await go(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      assert.equal(overflow, 0, `${route} overflow at ${width}`);
      if (width === 375)
        await page.screenshot({ path: `${artifacts}/${route}-mobile.png` });
      report.push({ route, width, overflow });
    }
  }
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  for (const route of ["builds", "stock", "contact"]) {
    await go(route);
    const accessibility = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll("[data-reveal]")].some(
        (e) => +getComputedStyle(e).opacity < 1,
      ),
      height: document.querySelector(".build-film,.stock-stage,.contact-brief")
        .offsetHeight,
    }));
    assert.equal(accessibility.hidden, false);
    report.push({ route, reducedMotion: accessibility });
  }
  await go("");
  await page.click("[data-enter]");
  assert.equal(
    await page.$eval(".entrance", (e) => e.classList.contains("gone")),
    true,
  );
  await wait(1000); // Entrance must finish fading before header can receive a click.
  await page.click("#menu-toggle");
  await page.waitForFunction(
    () =>
      document.querySelector("#menu-toggle").getAttribute("aria-expanded") ===
      "true",
  );
  await wait(900); // Wait for the menu's clip-path to expose the link hit area.
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click('#menu a[href="/builds"]'),
  ]);
  await page.waitForFunction(
    () =>
      location.pathname === "/builds" &&
      document.querySelector("[data-motion-page]")?.dataset.motionReady ===
        "true",
  );
  await page.reload({ waitUntil: "networkidle0" });
  assert.equal(
    await page.$eval("[data-motion-page]", (e) => e.dataset.motionReady),
    "true",
  );
  assert.deepEqual(errors, [], `browser errors: ${errors.join(" | ")}`);
  writeFileSync(`${artifacts}/report.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({ passed: true, checks: report, artifacts }, null, 2),
  );
} finally {
  await browser.close();
}
