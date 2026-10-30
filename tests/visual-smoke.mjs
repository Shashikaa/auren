import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-sandbox"],
});

const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const routes = ["stock", "builds", "contact"];
const page = await browser.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.emulateMediaFeatures([
  { name: "prefers-reduced-motion", value: "reduce" },
]);
const homeResponse = await page.goto(`${base}/`, { waitUntil: "networkidle0" });
assert.equal(homeResponse.status(), 200, "home should return HTTP 200");
await page.click("[data-enter]");
assert.equal(
  await page.$eval(".entrance", (node) => node.classList.contains("gone")),
  true,
);
assert.equal(
  await page.evaluate(
    () => getComputedStyle(document.body).overflow !== "hidden",
  ),
  true,
);
assert.equal(
  await page.$eval('.menu-links a[href="/builds"]', (node) =>
    node.getAttribute("href"),
  ),
  "/builds",
);
await page.emulateMediaFeatures([
  { name: "prefers-reduced-motion", value: "no-preference" },
]);
for (const route of routes) {
  const response = await page.goto(`${base}/${route}`, {
    waitUntil: "networkidle0",
  });
  assert.equal(response.status(), 200, `${route} should return HTTP 200`);
  assert.equal(
    await page.$eval("[data-motion-page]", (node) => node.dataset.motionPage),
    route,
  );
  await page.evaluate(async () => {
    const step = Math.max(400, window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 300));
  });
  const images = await page.$$eval("img", (nodes) =>
    nodes.map((image) => ({
      src: image.currentSrc,
      complete: image.complete,
      width: image.naturalWidth,
      html: image.outerHTML,
    })),
  );
  const failedImages = images.filter(
    (image) => !image.complete || image.width === 0,
  );
  assert.deepEqual(
    failedImages,
    [],
    `${route} should load every image: ${JSON.stringify(failedImages)}`,
  );
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  assert.equal(
    overflow,
    0,
    `${route} should not overflow horizontally at 1440px`,
  );
}

await page.goto(`${base}/stock`, { waitUntil: "networkidle0" });
await page.click("#menu-toggle");
assert.equal(
  await page.evaluate(() => document.body.classList.contains("menu-open")),
  true,
);
assert.equal(await page.$eval("#menu", (node) => node.inert), false);
await page.keyboard.press("Escape");
assert.equal(
  await page.evaluate(() => document.body.classList.contains("menu-open")),
  false,
);

async function readTransform(route, sectionSelector, targetSelector, ratio) {
  await page.goto(`${base}/${route}`, { waitUntil: "networkidle0" });
  return page.evaluate(
    async ({ sectionSelector, targetSelector, ratio }) => {
      const section = document.querySelector(sectionSelector);
      window.scrollTo(0, section.offsetTop + section.offsetHeight * ratio);
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      return getComputedStyle(document.querySelector(targetSelector)).transform;
    },
    { sectionSelector, targetSelector, ratio },
  );
}

const stockEarly = await readTransform(
  "stock",
  ".stock-stage",
  ".stock-vehicle--1",
  0.18,
);
const stockLate = await readTransform(
  "stock",
  ".stock-stage",
  ".stock-vehicle--1",
  0.7,
);
assert.notEqual(
  stockEarly,
  stockLate,
  "stock selector should move with scroll",
);

const buildEarly = await readTransform(
  "builds",
  ".build-film",
  ".build-film__track",
  0.18,
);
const buildLate = await readTransform(
  "builds",
  ".build-film",
  ".build-film__track",
  0.72,
);
assert.notEqual(
  buildEarly,
  buildLate,
  "build filmstrip should move with scroll",
);

const contactEarly = await readTransform(
  "contact",
  ".contact-brief",
  ".contact-brief__visual img",
  0.12,
);
const contactLate = await readTransform(
  "contact",
  ".contact-brief",
  ".contact-brief__visual img",
  0.7,
);
assert.notEqual(
  contactEarly,
  contactLate,
  "contact image should parallax while the form remains in natural flow",
);

await page.goto(`${base}/contact`, { waitUntil: "networkidle0" });
await page.click('#build-form button[type="submit"]');
assert.match(
  await page.$eval("#build-form-status", (node) => node.textContent),
  /Complete each field/,
);
await page.type("#build-name", "Example Client");
await page.type("#build-email", "client@example.com");
await page.type("#build-vehicle", "Example vehicle");
await page.type("#build-vision", "A restrained, cohesive build.");
await page.click('#build-form button[type="submit"]');
assert.match(
  await page.$eval("#build-form-status", (node) => node.textContent),
  /No information was sent/,
);

await page.setViewport({ width: 375, height: 844, deviceScaleFactor: 1 });
for (const route of routes) {
  await page.goto(`${base}/${route}`, { waitUntil: "networkidle0" });
  const metrics = await page.evaluate(() => ({
    overflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    h1Visible:
      getComputedStyle(document.querySelector("h1")).visibility !== "hidden",
    mainHeight: document.querySelector("main").getBoundingClientRect().height,
  }));
  assert.equal(
    metrics.overflow,
    0,
    `${route} should not overflow horizontally at 375px`,
  );
  assert.equal(
    metrics.h1Visible,
    true,
    `${route} mobile headline should remain visible`,
  );
  assert.ok(
    metrics.mainHeight > 1600,
    `${route} should retain its full mobile content`,
  );
}

await page.emulateMediaFeatures([
  { name: "prefers-reduced-motion", value: "reduce" },
]);
await page.goto(`${base}/stock`, { waitUntil: "networkidle0" });
assert.equal(
  await page.$eval("[data-reveal]", (node) => getComputedStyle(node).opacity),
  "1",
);

assert.deepEqual(errors, [], `browser console errors: ${errors.join(" | ")}`);
await browser.close();
console.log("visual smoke checks passed");
