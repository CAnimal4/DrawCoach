
import { GOALS, type AnalyzeRequest, type Critique, type CritiqueImprovement, type Goal, type ImageMetrics } from "./types";

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const MAX_CACHE_SIZE = 150;

type CachedCritique = {
  expiresAt: number;
  critique: Critique;
};

const critiqueCache = new Map<string, CachedCritique>();

type Candidate = CritiqueImprovement & {
  tags: string[];
  score: number;
};

const goalHints: Record<Goal, string> = {
  realistic: "Make the next pass feel more believable by tightening light, depth, and proportion.",
  simple: "The quickest win is to remove visual competition so the main idea reads first.",
  detailed: "Add detail only where it helps the focal point, then keep quieter areas calm.",
  elegant: "Aim for cleaner spacing, softer contrast choices, and fewer competing marks.",
  playful: "Push the fun by making the focal shape clearer and adding one lively accent.",
  "less cluttered": "Clear the busy areas first so the strongest part of the drawing can breathe.",
  "more 3D": "Depth will improve fastest through stronger value grouping and clearer overlap.",
  "better shading": "Focus on a simpler light pattern before adding more surface detail.",
};

export function analyzeWithCache(
  request: AnalyzeRequest,
  now = Date.now(),
): Critique & { cached: boolean } {
  const key = cacheKey(request);
  const cached = critiqueCache.get(key);

  if (cached && cached.expiresAt > now) {
    return { ...cached.critique, cached: true };
  }

  const critique = generateCritique(request.goal, request.metrics);
  critiqueCache.set(key, { critique, expiresAt: now + CACHE_TTL_MS });
  pruneCache(now);

  return { ...critique, cached: false };
}

export function generateCritique(goal: Goal, metrics: ImageMetrics): Critique {
  const candidates = buildCandidates(metrics);
  const prioritized = prioritizeForGoal(goal, candidates);
  const improvements = dedupeByFix(prioritized).slice(0, selectCount(goal, metrics));

  return {
    summary: buildSummary(goal, metrics),
    improvements,
    nextStep: buildNextStep(goal, improvements, metrics),
  };
}

export function isGoal(value: unknown): value is Goal {
  return typeof value === "string" && GOALS.includes(value as Goal);
}

export function isImageMetrics(value: unknown): value is ImageMetrics {
  if (!value || typeof value !== "object") {
    return false;
  }

  const metrics = value as Record<string, unknown>;
  return (
    isPositiveNumber(metrics.width) &&
    isPositiveNumber(metrics.height) &&
    isUnitNumber(metrics.brightness) &&
    isUnitNumber(metrics.contrast) &&
    isUnitNumber(metrics.edgeDensity) &&
    isUnitNumber(metrics.centerOffset) &&
    isUnitNumber(metrics.clutter)
  );
}

export function clearCritiqueCacheForTest(): void {
  critiqueCache.clear();
}

export function critiqueCacheSizeForTest(): number {
  return critiqueCache.size;
}

function buildSummary(goal: Goal, metrics: ImageMetrics): string {
  if (metrics.brightness < 0.28) {
    return `For a ${goal} result, the drawing reads a little dark, so the first pass should separate the main shape from the background.`;
  }

  if (metrics.contrast < 0.12) {
    return `For a ${goal} result, the image is gentle but flat, so clearer light and dark groups will help it read faster.`;
  }

  if (metrics.clutter > 0.54) {
    return `For a ${goal} result, the drawing has plenty of activity, but the focal idea needs more quiet space around it.`;
  }

  if (metrics.edgeDensity < 0.045) {
    return `For a ${goal} result, the drawing is very spare, so one or two stronger structure lines would make it feel more intentional.`;
  }

  if (metrics.centerOffset > 0.34) {
    return `For a ${goal} result, the main visual weight sits off balance, so a small composition adjustment will make it feel steadier.`;
  }

  return goalHints[goal];
}

function buildCandidates(metrics: ImageMetrics): Candidate[] {
  const candidates: Candidate[] = [];

  candidates.push(
    metrics.brightness < 0.32
      ? {
          tags: ["brightness", "shading", "realistic"],
          score: 0.9 - metrics.brightness,
          what: "The overall image is quite dark, especially around the main shapes.",
          why: "When values are too close to black, viewers lose the edges and form changes you worked on.",
          fix: "Lighten the background or add one mid-tone highlight on the subject before adding more detail.",
        }
      : {
          tags: ["brightness", "elegant"],
          score: 0.28,
          what: "The value range is readable, but the light areas could be grouped more cleanly.",
          why: "Grouped light makes the drawing feel calmer and easier to scan.",
          fix: "Pick one main light area and gently reduce smaller bright spots around it.",
        },
  );

  candidates.push(
    metrics.contrast < 0.14
      ? {
          tags: ["contrast", "shading", "3d", "realistic"],
          score: 0.85 - metrics.contrast,
          what: "The drawing has low contrast, so the forms look a bit flat.",
          why: "Clearer light and dark groups make depth, shading, and material changes easier to understand.",
          fix: "Choose one shadow side and darken it by a small step while leaving the lit side alone.",
        }
      : {
          tags: ["contrast", "elegant"],
          score: metrics.contrast > 0.34 ? 0.55 : 0.26,
          what: "Some contrast changes are strong enough to pull attention away from the focal point.",
          why: "Too many high-contrast spots can make a simple drawing feel noisy.",
          fix: "Soften one nonessential dark edge or bright patch outside the main subject.",
        },
  );

  candidates.push(
    metrics.edgeDensity > 0.16
      ? {
          tags: ["clutter", "simple", "elegant"],
          score: metrics.edgeDensity + metrics.clutter,
          what: "There are many small edges and marks competing with each other.",
          why: "Busy edge detail makes it harder to see the main idea at a glance.",
          fix: "Erase or fade three tiny marks in the least important area of the drawing.",
        }
      : {
          tags: ["detail", "structure"],
          score: metrics.edgeDensity < 0.05 ? 0.62 : 0.24,
          what: "The drawing has very few structural edges.",
          why: "A small amount of structure helps the viewer understand the object or character faster.",
          fix: "Add one clean contour line or one interior guide line where the form changes direction.",
        },
  );

  candidates.push(
    metrics.centerOffset > 0.26
      ? {
          tags: ["composition", "elegant", "simple"],
          score: metrics.centerOffset + 0.35,
          what: "The visual weight sits noticeably away from the center.",
          why: "An off-balance focal point can feel accidental unless the empty space is clearly intentional.",
          fix: "Crop slightly toward the subject or add one small balancing shape on the quieter side.",
        }
      : {
          tags: ["composition", "playful"],
          score: 0.24,
          what: "The composition is stable, but the focal point could feel more intentional.",
          why: "A clear focal point helps viewers know where to look first.",
          fix: "Make the most important shape a little larger, darker, or cleaner than its neighbors.",
        },
  );

  candidates.push(
    metrics.clutter > 0.48
      ? {
          tags: ["clutter", "simple", "less cluttered"],
          score: metrics.clutter + 0.4,
          what: "The image has a cluttered feel because detail is spread across too many areas.",
          why: "When everything gets equal attention, the strongest idea has less impact.",
          fix: "Choose one background or side area and simplify it to two or three larger shapes.",
        }
      : {
          tags: ["detail", "playful"],
          score: metrics.clutter < 0.2 ? 0.56 : 0.22,
          what: "The drawing is clean, but it may be missing a small supporting detail.",
          why: "One well-placed detail can add personality without making the piece busy.",
          fix: "Add a single accent detail near the focal point, then stop and reassess.",
        },
  );

  candidates.push({
    tags: ["3d", "shading", "realistic"],
    score: goalScore(metrics, "depth"),
    what: "The form changes could use a clearer front, side, and shadow relationship.",
    why: "Simple plane changes are what make a flat shape start to feel three-dimensional.",
    fix: "Mark one side as the shadow side and keep that side consistently darker across the drawing.",
  });

  candidates.push({
    tags: ["playful", "detail"],
    score: 0.42,
    what: "The drawing could use one clearer moment of personality.",
    why: "A playful focal accent gives viewers something memorable to connect with.",
    fix: "Add one exaggerated curve, color accent, or repeated shape near the main subject.",
  });

  return candidates;
}

function prioritizeForGoal(goal: Goal, candidates: Candidate[]): CritiqueImprovement[] {
  const preferredTags: Record<Goal, string[]> = {
    realistic: ["realistic", "3d", "shading", "contrast", "composition"],
    simple: ["simple", "clutter", "composition"],
    detailed: ["detail", "structure", "contrast"],
    elegant: ["elegant", "composition", "simple", "contrast"],
    playful: ["playful", "composition", "detail"],
    "less cluttered": ["less cluttered", "clutter", "simple", "composition"],
    "more 3D": ["3d", "shading", "contrast", "realistic"],
    "better shading": ["shading", "contrast", "brightness", "3d"],
  };

  const tags = preferredTags[goal];

  return [...candidates]
    .sort((left, right) => {
      const leftBoost = tags.some((tag) => left.tags.includes(tag)) ? 0.45 : 0;
      const rightBoost = tags.some((tag) => right.tags.includes(tag)) ? 0.45 : 0;
      return right.score + rightBoost - (left.score + leftBoost);
    })
    .map(({ what, why, fix }) => ({ what, why, fix }));
}

function dedupeByFix(improvements: CritiqueImprovement[]): CritiqueImprovement[] {
  const seen = new Set<string>();

  return improvements.filter((improvement) => {
    const key = improvement.fix.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function selectCount(goal: Goal, metrics: ImageMetrics): number {
  if (goal === "detailed" || goal === "more 3D" || metrics.clutter > 0.58) {
    return 5;
  }

  if (metrics.edgeDensity < 0.04 || metrics.contrast < 0.1) {
    return 4;
  }

  return 3;
}

function cacheKey({ goal, imageHash, metrics }: AnalyzeRequest): string {
  const rounded = {
    width: metrics.width,
    height: metrics.height,
    brightness: roundForCache(metrics.brightness),
    contrast: roundForCache(metrics.contrast),
    edgeDensity: roundForCache(metrics.edgeDensity),
    centerOffset: roundForCache(metrics.centerOffset),
    clutter: roundForCache(metrics.clutter),
  };

  return `${imageHash}:${goal}:${JSON.stringify(rounded)}`;
}

function pruneCache(now: number): void {
  for (const [key, cached] of critiqueCache) {
    if (cached.expiresAt <= now) {
      critiqueCache.delete(key);
    }
  }

  while (critiqueCache.size > MAX_CACHE_SIZE) {
    const oldestKey = critiqueCache.keys().next().value as string | undefined;

    if (!oldestKey) {
      break;
    }

    critiqueCache.delete(oldestKey);
  }
}

function roundForCache(value: number): number {
  return Math.round(value * 100) / 100;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isUnitNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function goalScore(metrics: ImageMetrics, type: "depth"): number {
  if (type === "depth") {
    return 0.45 + Math.max(0, 0.22 - metrics.contrast) + metrics.centerOffset * 0.25;
  }

  return 0.4;
}

function buildNextStep(
  goal: Goal,
  improvements: CritiqueImprovement[],
  metrics: ImageMetrics,
): string {
  const firstFix = improvements[0]?.fix.toLowerCase() ?? "";

  if (goal === "better shading" || firstFix.includes("shadow") || metrics.contrast < 0.14) {
    return "Next step: focus only on one clear shadow side.";
  }

  if (goal === "less cluttered" || firstFix.includes("simplify") || firstFix.includes("erase")) {
    return "Next step: focus only on simplifying one quiet area.";
  }

  if (goal === "more 3D" || firstFix.includes("darker")) {
    return "Next step: focus only on one front-side-shadow relationship.";
  }

  if (goal === "simple" || metrics.edgeDensity > 0.16) {
    return "Next step: focus only on the main shape.";
  }

  if (goal === "detailed" || firstFix.includes("detail")) {
    return "Next step: focus only on one useful focal detail.";
  }

  if (goal === "playful") {
    return "Next step: focus only on one playful accent.";
  }

  if (goal === "elegant") {
    return "Next step: focus only on cleaner spacing around the focal point.";
  }

  return "Next step: focus only on the clearest value change.";
}
