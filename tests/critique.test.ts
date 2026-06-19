
import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeWithCache,
  clearCritiqueCacheForTest,
  critiqueCacheSizeForTest,
  generateCritique,
} from "../lib/critique";
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

const baseRequest = {
  goal: "realistic" as const,
  imageHash: "test-image",
  metrics: baseMetrics,
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
    assert.match(critique.nextStep, /^Next step: focus only on .+/);
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

  const first = analyzeWithCache(baseRequest, 1_000);
  const second = analyzeWithCache(baseRequest, 1_100);

  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(critiqueCacheSizeForTest(), 1);
  assert.deepEqual(second.improvements, first.improvements);
});

test("cache separates identical metrics with different image hashes", () => {
  clearCritiqueCacheForTest();

  const first = analyzeWithCache(baseRequest, 1_000);
  const second = analyzeWithCache({ ...baseRequest, imageHash: "other-image" }, 1_100);

  assert.equal(first.cached, false);
  assert.equal(second.cached, false);
  assert.equal(critiqueCacheSizeForTest(), 2);
});
