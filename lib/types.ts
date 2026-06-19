export const GOALS = [
  "realistic",
  "simple",
  "detailed",
  "elegant",
  "playful",
  "less cluttered",
  "more 3D",
  "better shading",
] as const;

export type Goal = (typeof GOALS)[number];

export type ImageMetrics = {
  width: number;
  height: number;
  brightness: number;
  contrast: number;
  edgeDensity: number;
  centerOffset: number;
  clutter: number;
};

export type CritiqueImprovement = {
  what: string;
  why: string;
  fix: string;
};

export type Critique = {
  summary: string;
  improvements: CritiqueImprovement[];
};

export type AnalyzeRequest = {
  goal: Goal;
  metrics: ImageMetrics;
};

export type AnalyzeResponse = Critique & {
  cached?: boolean;
};
