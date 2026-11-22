import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8"
};
let server;
let browser;
let baseUrl;
const configuredBaseUrl = process.env.DHIE_BASE_URL;

test("campaign works in Chromium desktop and mobile viewports", async t => {
  if (!configuredBaseUrl) {
    server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const file = resolve(root, relative);
      if (file !== root && !file.startsWith(root + sep)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const info = await stat(file);
      if (!info.isFile()) throw new Error("Not a file");
      const content = await readFile(file);
      response.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
      response.end(content);
    } catch {
      response.writeHead(404).end("Not found");
    }
    });
    await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}/`;
  } else {
    baseUrl = configuredBaseUrl.endsWith("/") ? configuredBaseUrl : configuredBaseUrl + "/";
  }
  browser = await chromium.launch({ headless: true });
  t.after(async () => {
    await browser?.close();
    if (server) await new Promise(resolveClose => server.close(resolveClose));
  });

  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByText("14 of 14 chapter records passed source and mechanics validation.").waitFor();
  assert.equal(await page.locator("#dashPlayable").textContent(), "14 / 14");
  await page.keyboard.press("Tab");
  const firstKeyboardTarget = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    id: document.activeElement?.id,
    className: document.activeElement?.className,
    href: document.activeElement?.getAttribute("href"),
    text: document.activeElement?.textContent?.trim()
  }));
  assert.equal(
    firstKeyboardTarget.className === "skip-link",
    true,
    "first keyboard stop should be the skip link; focused target: " + JSON.stringify(firstKeyboardTarget)
  );
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#commandDashboard");

  await page.locator('[data-chapter="14"]').click();
  await page.locator("#activeChapterTitle").waitFor();
  await page.getByRole("button", { name: "Enter the situation" }).click();
  await page.getByRole("button", { name: "Review directives" }).click();
  await page.locator(".option").first().click();
  await page.getByRole("button", { name: "Record directive" }).click();
  await page.getByRole("button", { name: "Take the knowledge check" }).click();

  const chapter14 = JSON.parse(await readFile(resolve(root, "content/chapter-14.json"), "utf8"));
  for (const question of chapter14.assessment) {
    await page.locator(`input[name="${question.id}"][value="${question.answer}"]`).check();
  }
  await page.getByRole("button", { name: "Check answers" }).click();
  await page.getByText("Result: 4 / 4").waitFor();
  await page.getByRole("button", { name: "Open chapter archive" }).click();
  assert.equal(await page.locator(".coverage tbody tr").count(), chapter14.coverage.length);
  await page.getByRole("button", { name: "Return to campaign overview" }).click();
  assert.match(await page.locator("#dashCompleted").textContent(), /1 \/ 14/);

  await page.locator('[data-chapter="2"]').click();
  await page.getByRole("heading", { name: /Organizational Structure/ }).waitFor();
  await page.getByRole("button", { name: "← Campaign overview" }).click();
  await page.locator('[data-chapter="14"]').click();
  await page.locator("#activeChapterTitle").waitFor();
  assert.equal(await page.locator("#campaignChapterStat").textContent(), "14 / 14");
  assert.equal(await page.locator("#chapterCoverageStat").textContent(), "12 / 12");
  assert.deepEqual(pageErrors, []);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("14 of 14 chapter records passed source and mechanics validation.").waitFor();
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  assert.equal(overflow, false, "mobile dashboard should not overflow horizontally");
  await page.locator('[data-chapter="14"]').click();
  await page.locator("#activeChapterTitle").waitFor();
  assert.deepEqual(pageErrors, []);
});
