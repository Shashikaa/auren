import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("stock, builds, and contact routes select the shared motion shell", () => {
  const shell = read("app/components/inner/InnerPageShell.js");
  assert.match(shell, /data-motion-page=\{page\}/);
  assert.match(shell, /InnerMotion/);
  for (const route of ["stock", "builds", "contact"]) {
    const path = new URL(`app/${route}/page.js`, root);
    assert.equal(existsSync(path), true, `${route} page should exist`);
    const source = read(`app/${route}/page.js`);
    assert.match(source, new RegExp(`page=["']${route}["']`));
  }
});

test("shared navigation targets real routes", () => {
  const chrome = read("app/components/layout/SiteChrome.js");
  assert.match(chrome, /href="\/builds"/);
  assert.match(chrome, /href="\/stock"/);
  assert.match(chrome, /href="\/contact"/);
  assert.match(chrome, /href="\/#home"/);
});

test("inner page runtime and styles are owned by the inner shell", () => {
  assert.equal(
    existsSync(new URL("public/scripts/inner-pages.js", root)),
    true,
  );
  const layout = read("app/layout.js");
  assert.doesNotMatch(layout, /inner-pages\.css/);
  assert.match(
    read("app/components/inner/InnerPageShell.js"),
    /inner-pages\.css/,
  );
  assert.match(read("app/globals.css"), /body:has\(\.entrance:not\(\.gone\)\)/);
  assert.doesNotMatch(layout, /body className="locked"/);
  const css = read("app/styles/inner-pages.css");
  assert.match(css, /\.inner-page/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
