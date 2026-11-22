export const TOTAL_CHAPTERS = 14;
const EFFECT_KEYS = [
  "evidence_confidence",
  "accountability",
  "institutional_cohesion",
  "public_impact"
];

function chapterNumber(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1 || id > TOTAL_CHAPTERS) {
    throw new Error("Chapter must be a whole number from 1 to 14.");
  }
  return id;
}

async function readJson(path, fetcher) {
  const response = await fetcher(path, { cache: "no-cache" });
  if (!response.ok) throw new Error("Unable to load " + path + " (HTTP " + response.status + ").");
  return response.json();
}

export async function loadCampaignInventory(fetcher = globalThis.fetch) {
  if (typeof fetcher !== "function") throw new Error("A Fetch-compatible loader is required.");
  const inventory = await readJson("./content/source-inventory.json", fetcher);
  if (inventory.verified_chapter_count !== TOTAL_CHAPTERS ||
      !Array.isArray(inventory.chapter_titles) ||
      inventory.chapter_titles.length !== TOTAL_CHAPTERS) {
    throw new Error("The source inventory does not contain the expected 14-chapter campaign.");
  }
  return inventory;
}

export async function loadChapter(chapterId, fetcher = globalThis.fetch) {
  if (typeof fetcher !== "function") throw new Error("A Fetch-compatible loader is required.");
  const id = chapterNumber(chapterId);
  const filename = String(id).padStart(2, "0");
  const [chapter, inventory] = await Promise.all([
    readJson("./content/chapter-" + filename + ".json", fetcher),
    loadCampaignInventory(fetcher)
  ]);

  const expected = inventory["chapter_" + id + "_sections"];
  if (!chapter || chapter.chapter_id !== String(id) ||
      !chapter.briefing || !chapter.scenario ||
      !Array.isArray(chapter.assessment) ||
      !Array.isArray(chapter.coverage) ||
      !Array.isArray(expected)) {
    throw new Error("Chapter " + id + " has an incomplete or mismatched content record.");
  }

  const exactCoverage = chapter.coverage.length === expected.length &&
    chapter.coverage.every((row, index) =>
      row.section_id === expected[index][0] &&
      row.title === expected[index][1] &&
      row.source_page === String(expected[index][2])
    );
  if (!exactCoverage) throw new Error("Chapter " + id + " does not match the verified source inventory.");

  const sectionIds = new Set(expected.map(row => row[0]));
  const questionsValid = chapter.assessment.length === 4 &&
    chapter.assessment.every(question =>
      Array.isArray(question.options) &&
      Number.isInteger(question.answer) &&
      question.answer >= 0 &&
      question.answer < question.options.length &&
      Array.isArray(question.section_ids) &&
      question.section_ids.length > 0 &&
      question.section_ids.every(sectionId => sectionIds.has(sectionId))
    );
  if (!questionsValid) throw new Error("Chapter " + id + " has an invalid knowledge-check record.");

  const optionsValid = Array.isArray(chapter.scenario.options) &&
    chapter.scenario.options.length === 3 &&
    chapter.scenario.options.every(option =>
      typeof option.id === "string" &&
      EFFECT_KEYS.every(key =>
        Number.isInteger(option.effects?.[key]) &&
        option.effects[key] >= -2 &&
        option.effects[key] <= 2
      )
    );
  if (!optionsValid) throw new Error("Chapter " + id + " has invalid decision mechanics.");

  return chapter;
}
