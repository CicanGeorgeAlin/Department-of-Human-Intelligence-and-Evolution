import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat, writeFile } from "node:fs/promises";
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
    if (chapterId === 1) {
      const controlAudit = await page.locator("#campaignExperience").evaluate(root => ({
        unnamedButtons: [...root.querySelectorAll("button")].filter(button =>
          !button.disabled && !(button.getAttribute("aria-label") || button.innerText || button.title).trim()
        ).length,
        unlabeledRadios: [...root.querySelectorAll('input[type="radio"]')].filter(input =>
          !input.labels || input.labels.length === 0
        ).length
      }));
      assert.equal(controlAudit.unnamedButtons, 0, "visible campaign buttons should have accessible names");
      assert.equal(controlAudit.unlabeledRadios, 0, "assessment radio controls should have associated labels");
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement?.classList.contains("option")), true,
        "keyboard focus should reach the first decision option");
      await page.keyboard.press("Enter");
      assert.equal(await page.locator(".option").first().evaluate(option => option.classList.contains("selected")), true);
    } else {
      await page.locator(".option").first().click();
    }
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
    // Verify an in-progress chapter survives a real browser refresh.
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("14 of 14 chapter records passed source and mechanics validation.").waitFor();
    await page.locator('[data-chapter="6"]').click();
    await page.getByRole("button", { name: "Enter the situation" }).click();
    await page.getByRole("button", { name: "Review directives" }).click();
    await page.locator(".option").nth(1).click();
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("14 of 14 chapter records passed source and mechanics validation.").waitFor();
    await page.getByRole("button", { name: "Resume Chapter 6" }).click();
    assert.equal(await page.locator("#steps .step.active").textContent(), "03 Decision");
    assert.equal(await page.locator(".option.selected").count(), 1,
      "selected decision should survive a browser refresh");
    await page.getByRole("button", { name: "Record directive" }).click();
    await page.getByRole("button", { name: "Take the knowledge check" }).click();
    const chapterSix = JSON.parse(await readFile(resolve(root, "content/chapter-06.json"), "utf8"));
    const firstQuestion = chapterSix.assessment[0];
    await page.locator(`input[name="${firstQuestion.id}"][value="${firstQuestion.answer}"]`).check();
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("14 of 14 chapter records passed source and mechanics validation.").waitFor();
    await page.getByRole("button", { name: "Resume Chapter 6" }).click();
    assert.equal(await page.locator("#steps .step.active").textContent(), "05 Assessment");
    assert.equal(await page.locator(`input[name="${firstQuestion.id}"][value="${firstQuestion.answer}"]`).isChecked(), true,
      "assessment answers should survive a browser refresh");

    // Begin the import rejection/recovery checks from a clean local campaign.
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("14 of 14 chapter records passed source and mechanics validation.").waitFor();
    const invalidPath = join(exportDir, "invalid-save.json");
    await writeFile(invalidPath, JSON.stringify({ format: "not-a-dhie-save", version: 1 }));
    await page.locator("#importSave").setInputFiles(invalidPath);
    await page.locator("#campaignStatus").getByText("This is not a Director's Mandate save file.").waitFor();
    assert.match(await page.locator("#dashCompleted").textContent(), /0 \/ 14/,
      "an invalid import must not overwrite the current empty campaign");

    const importedMessage = page.locator("#campaignStatus").getByText("Save imported. Resume the saved chapter from the campaign overview.");
    await page.locator("#importSave").setInputFiles(savePath);
    await importedMessage.waitFor();
    assert.match(await page.locator("#dashCompleted").textContent(), /14 \/ 14/);

    // Selecting the identical file again verifies that the file input was reset.
    await page.locator("#importSave").setInputFiles(savePath);
    await importedMessage.waitFor();
    assert.match(await page.locator("#dashCompleted").textContent(), /14 \/ 14/,
      "re-importing the same valid backup should remain safe");

    // Corrupt browser storage should fall back to a clean initial state, not crash the app.
    await page.evaluate(() => localStorage.setItem("dhie-directors-mandate-save-v1", "{ definitely not JSON"));
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("14 of 14 chapter records passed source and mechanics validation.").waitFor();
    assert.match(await page.locator("#dashCompleted").textContent(), /0 \/ 14/,
      "corrupted local storage should recover to a clean campaign state");
    await page.locator("#importSave").setInputFiles(savePath);
    await importedMessage.waitFor();
    assert.match(await page.locator("#dashCompleted").textContent(), /14 \/ 14/,
      "a valid backup should restore progress after storage recovery");
    await page.locator('[data-chapter="14"]').click();
    await page.locator("#activeChapterTitle").waitFor();
    assert.equal(await page.locator("#campaignChapterStat").textContent(), "14 / 14");
    assert.equal(await page.locator("#chapterCoverageStat").textContent(), "12 / 12");

    // A cancelled restart must be a no-op. Confirmed restart resets only Chapter 6.
    await page.locator('[data-chapter="6"]').click();
    await page.locator("#activeChapterTitle").waitFor();
    const beforeRestart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("dhie-directors-mandate-save-v1"))
    );
    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("button", { name: "Restart this chapter" }).click();
    const afterCancel = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("dhie-directors-mandate-save-v1"))
    );
    assert.deepEqual(afterCancel, beforeRestart, "cancelling restart must leave the save unchanged");

    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Restart this chapter" }).click();
    assert.equal(await page.locator("#steps .step.active").textContent(), "01 Briefing");
    assert.equal(await page.locator("#decisionState").textContent(), "Pending");
    const afterRestart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("dhie-directors-mandate-save-v1"))
    );
    assert.equal(afterRestart.chapterProgress["6"].decision, null);
    assert.deepEqual(afterRestart.chapterProgress["6"].answers, {});
    assert.equal(afterRestart.campaign.completedChapters.includes("6"), false);
    assert.equal(afterRestart.campaign.completedChapters.length, 13);
    assert.deepEqual(afterRestart.chapterProgress["5"], beforeRestart.chapterProgress["5"],
      "another chapter's progress must remain unchanged");
    assert.equal(afterRestart.decisionLog.some(entry => entry.chapterId === "6"), false);
    const replayedMetrics = {
      evidence_confidence: 5,
      accountability: 5,
      institutional_cohesion: 5,
      public_impact: 5
    };
    for (const entry of afterRestart.decisionLog) {
      for (const key of Object.keys(replayedMetrics)) {
        replayedMetrics[key] = Math.max(0, Math.min(10, replayedMetrics[key] + entry.effects[key]));
      }
    }
    assert.deepEqual(afterRestart.metrics, replayedMetrics,
      "campaign indicators must equal a replay of the remaining decision log");
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
