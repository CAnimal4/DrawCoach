import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { GET as aiTxt } from "../app/ai.txt/route";
import { GET as llmsTxt } from "../app/llms.txt/route";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import {
  analyzeWithCache,
  clearCritiqueCacheForTest,
  critiqueCacheSizeForTest,
  generateCritique,
} from "../lib/critique";
import { buildFeedbackMailto } from "../lib/feedback";
import { policies } from "../lib/legal";
import {
  buildShareData,
  buildShareLinks,
  FALLBACK_SHARE_URL,
  PRIMARY_SHARE_URL,
  SHARE_PROMO_DISMISSED_KEY,
  SHARE_TEXT,
} from "../lib/share";
import { absoluteUrl, ROUTES, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../lib/site";
import { GOALS, type ImageMetrics } from "../lib/types";

const baseMetrics: ImageMetrics = {
  width: 512,
  height: 384,
  brightness: 0.5,
  contrast: 0.2,
  edgeDensity: 0.09,
  centerOffset: 0.1,
  clutter: 0.24,
};

test("dark low-contrast metrics produce brightness and contrast advice", () => {
  const critique = generateCritique("better shading", {
    ...baseMetrics,
    brightness: 0.18,
    contrast: 0.08,
  });

  const joined = JSON.stringify(critique).toLowerCase();

  assert.match(critique.summary.toLowerCase(), /dark|flat|light|shadow/);
  assert.match(joined, /dark|lighten|highlight/);
  assert.match(joined, /contrast|shadow/);
});

test("high edge density produces clutter or simplification advice", () => {
  const critique = generateCritique("less cluttered", {
    ...baseMetrics,
    edgeDensity: 0.24,
    clutter: 0.72,
  });

  const joined = JSON.stringify(critique).toLowerCase();

  assert.match(joined, /clutter|busy|simplify|erase|fade/);
});

test("off-center saliency produces composition advice", () => {
  const critique = generateCritique("elegant", {
    ...baseMetrics,
    centerOffset: 0.58,
  });

  const joined = JSON.stringify(critique).toLowerCase();

  assert.match(joined, /center|off-balance|crop|composition|balancing/);
});

test("every goal returns three to five structured improvements", () => {
  for (const goal of GOALS) {
    const critique = generateCritique(goal, baseMetrics);

    assert.ok(critique.summary.length > 20);
    assert.ok(critique.improvements.length >= 3);
    assert.ok(critique.improvements.length <= 5);

    for (const improvement of critique.improvements) {
      assert.ok(improvement.what.length > 10);
      assert.ok(improvement.why.length > 10);
      assert.ok(improvement.fix.length > 10);
    }
  }
});

test("repeated identical input returns the cached critique", () => {
  clearCritiqueCacheForTest();

  const first = analyzeWithCache({ goal: "realistic", metrics: baseMetrics }, 1_000);
  const second = analyzeWithCache({ goal: "realistic", metrics: baseMetrics }, 1_100);

  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(critiqueCacheSizeForTest(), 1);
  assert.deepEqual(second.improvements, first.improvements);
});

test("share copy includes primary and fallback app links", () => {
  const shareData = buildShareData();
  const shareLinks = buildShareLinks();

  assert.equal(shareData.title, "DrawCoach");
  assert.equal(shareData.url, PRIMARY_SHARE_URL);
  assert.match(SHARE_TEXT, /drawcoach\.vercel\.app/);
  assert.match(SHARE_TEXT, /canimal4\.github\.io\/DrawCoach/);
  assert.match(shareLinks.mailto, /^mailto:/);
  assert.match(shareLinks.sms, /^sms:/);
  assert.equal(SHARE_PROMO_DISMISSED_KEY, "drawcoach-share-promo-dismissed");
  assert.equal(FALLBACK_SHARE_URL, "https://canimal4.github.io/DrawCoach/");
});

test("feedback mailto is encoded, sanitized, and honest", () => {
  const mailto = buildFeedbackMailto({
    feedback: "Love this. token=super-secret-value\nPlease add clearer shading notes.",
    replyEmail: "artist@example.com",
    pageUrl: "https://drawcoach.vercel.app/?debugToken=should-not-be-special",
    userAgent: "Test Browser API_KEY=abc123",
    viewport: "1280x800",
    timestamp: "2026-06-20T20:00:00.000Z",
  });
  const parsed = new URL(mailto);
  const body = parsed.searchParams.get("body") ?? "";

  assert.equal(parsed.protocol, "mailto:");
  assert.equal(parsed.pathname, "clarkbythebay@gmail.com");
  assert.equal(parsed.searchParams.get("subject"), "DrawCoach feedback");
  assert.match(body, /DrawCoach feedback/);
  assert.match(body, /token=\[redacted\]/);
  assert.match(body, /API_KEY=\[redacted\]/);
  assert.match(body, /email draft was opened locally/i);
  assert.doesNotMatch(body, /super-secret-value|abc123/);
});

test("legal policies include required MVP and future-change language", () => {
  const privacy = JSON.stringify(policies.privacy).toLowerCase();
  const terms = JSON.stringify(policies.terms).toLowerCase();
  const cookies = JSON.stringify(policies.cookies).toLowerCase();

  assert.match(privacy, /no accounts/);
  assert.match(privacy, /uploaded drawings/);
  assert.match(privacy, /local browser storage/);
  assert.match(terms, /more limited/);
  assert.match(terms, /subscription/);
  assert.match(cookies, /advertising|tracking/);
  assert.match(cookies, /localstorage|local storage/);
});

test("site metadata routes expose clean canonical URLs", () => {
  const paths = ROUTES.map((route) => route.path);
  const sitemapEntries = sitemap();
  const robotsFile = robots();

  assert.deepEqual(paths, ["/", "/about", "/privacy", "/terms", "/cookies"]);
  assert.equal(SITE_TITLE, "DrawCoach - Free Online Drawing Critique Tool");
  assert.match(SITE_DESCRIPTION, /free online tool/i);
  assert.equal(absoluteUrl("/about"), `${SITE_URL}/about/`);
  assert.ok(sitemapEntries.some((entry) => entry.url === `${SITE_URL}/about/`));
  assert.ok(sitemapEntries.some((entry) => entry.url === `${SITE_URL}/llms.txt`));
  assert.ok(sitemapEntries.some((entry) => entry.url === `${SITE_URL}/ai.txt`));
  assert.equal(robotsFile.sitemap, `${SITE_URL}/sitemap.xml`);
});

test("about page contains factual AI-readable answers", () => {
  const aboutSource = readFileSync(new URL("../app/about/page.tsx", import.meta.url), "utf8");
  const structuredDataSource = readFileSync(
    new URL("../lib/structured-data.ts", import.meta.url),
    "utf8",
  );

  assert.match(structuredDataSource, /What is DrawCoach\?/);
  assert.match(structuredDataSource, /How does DrawCoach work\?/);
  assert.match(structuredDataSource, /free online tool/i);
  assert.match(structuredDataSource, /simple visual-rule metrics/i);
  assert.match(structuredDataSource, /FAQPage/);
  assert.match(aboutSource, /FAQ_ITEMS/);
  assert.doesNotMatch(`${aboutSource}\n${structuredDataSource}`, /revolutionary|world-class|magic/i);
});

test("AI text endpoints describe the app clearly", async () => {
  const llmsBody = await llmsTxt().text();
  const aiBody = await aiTxt().text();

  assert.match(llmsBody, /free online drawing critique/i);
  assert.match(llmsBody, /No accounts/i);
  assert.match(llmsBody, /Sitemap: https:\/\/drawcoach\.vercel\.app\/sitemap\.xml/i);
  assert.match(aiBody, /Category: Free online drawing critique tool/i);
  assert.match(aiBody, /Image generation: Not offered/i);
  assert.match(aiBody, /Robots: https:\/\/drawcoach\.vercel\.app\/robots\.txt/i);
});
