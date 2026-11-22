import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep, join } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
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

  for (let chapterId = 1; chapterId <= 14; chapterId++) {
    await page.locator(`[data-chapter="${chapterId}"]`).click();
    await page.locator("#activeChapterTitle").waitFor();
    await page.getByRole("button", { name: "Enter the situation" }).click();
    await page.getByRole("button", { name: "Review directives" }).click();
    await page.locator(".option").first().click();
    await page.getByRole("button", { name: "Record directive" }).click();
    await page.getByRole("button", { name: "Take the knowledge check" }).click();

    const chapterData = JSON.parse(await readFile(resolve(root, `content/chapter-${String(chapterId).padStart(2, "0")}.json`), "utf8"));
    for (const question of chapterData.assessment) {
      await page.locator(`input[name="${question.id}"][value="${question.answer}"]`).check();
    }
    await page.getByRole("button", { name: "Check answers" }).click();
    await page.getByText("Result: 4 / 4").waitFor();
    if (chapterId === 14) {
      await page.getByRole("button", { name: "Open chapter archive" }).click();
      assert.equal(await page.locator(".coverage tbody tr").count(), chapterData.coverage.length);
      await page.getByRole("button", { name: "Return to campaign overview" }).click();
    } else {
      await page.getByRole("button", { name: "← Campaign overview" }).click();
    }
  }
  assert.match(await page.locator("#dashCompleted").textContent(), /14 \/ 14/);

  await page.locator('[data-chapter="2"]').click();
  await page.locator("#activeChapterTitle").waitFor();
  await page.getByRole("button", { name: "← Campaign overview" }).click();
  await page.locator('[data-chapter="14"]').click();
  await page.locator("#activeChapterTitle").waitFor();
  assert.equal(await page.locator("#campaignChapterStat").textContent(), "14 / 14");
  assert.equal(await page.locator("#chapterCoverageStat").textContent(), "12 / 12");

  const exportDir = await mkdtemp(join(tmpdir(), "dhie-save-"));
  try {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export save" }).click();
    const download = await downloadPromise;
    const savePath = join(exportDir, "campaign-save.json");
    await download.saveAs(savePath);
    const exported = JSON.parse(await readFile(savePath, "utf8"));
    assert.equal(exported.format, "dhie-directors-mandate-save");
    assert.equal(exported.campaign.completedChapters.length, 14);
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("14 of 14 chapter records passed source and mechanics validation.").waitFor();
    await page.locator("#importSave").setInputFiles(savePath);
    await page.getByText("Save imported. Resume the saved chapter from the campaign overview.").waitFor();
    assert.match(await page.locator("#dashCompleted").textContent(), /14 \/ 14/);
    await page.locator('[data-chapter="14"]').click();
    await page.locator("#activeChapterTitle").waitFor();
    assert.equal(await page.locator("#campaignChapterStat").textContent(), "14 / 14");
    assert.equal(await page.locator("#chapterCoverageStat").textContent(), "12 / 12");
  } finally {
    await rm(exportDir, { recursive: true, force: true });
  }
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
