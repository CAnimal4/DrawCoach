
"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { prepareImage } from "@/lib/client-image";
import { analyzeWithCache } from "@/lib/critique";
import { GOALS, type AnalyzeResponse, type Goal, type ImageMetrics } from "@/lib/types";

const ACCENTS = {
  ink: { color: "#1946d2", soft: "#eef3ff", name: "Ink" },
  graphite: { color: "#202124", soft: "#f0f1f3", name: "Graphite" },
  teal: { color: "#087f76", soft: "#e9f7f5", name: "Teal" },
  plum: { color: "#7a2e83", soft: "#f7edf8", name: "Plum" },
} as const;

const SETTINGS_KEY = "drawcoach-settings";
const ANALYSIS_CACHE_KEY = "drawcoach-analysis-cache";
const ANALYSIS_CACHE_TTL_MS = 1000 * 60 * 60 * 8;
const MAX_STORED_ANALYSES = 24;

const DAILY_PROMPTS = [
  "Draw a boat focusing on shadows.",
  "Draw something simple with only 5 lines.",
  "Add depth using line thickness.",
  "Sketch a mug using only soft edges.",
  "Draw a tiny room with one strong light source.",
  "Make a plant feel more 3D with overlap.",
  "Draw a shoe and simplify the background.",
  "Redraw an object with one playful exaggeration.",
] as const;

type UploadState = {
  fileName: string;
  imageHash: string;
  previewUrl: string;
  metrics: ImageMetrics;
};

type AnalysisRecord = {
  goal: Goal;
  response: AnalyzeResponse;
};

type AccentMode = keyof typeof ACCENTS;
type CritiqueMode = "coach" | "checklist";
type MotionMode = "gentle" | "still";
type PreviewMode = "balanced" | "large";
type SurfaceMode = "bright" | "soft";
type TextMode = "standard" | "large";
type WorkspaceMode = "spacious" | "compact";

type UserSettings = {
  accentMode: AccentMode;
  critiqueMode: CritiqueMode;
  motionMode: MotionMode;
  previewMode: PreviewMode;
  surfaceMode: SurfaceMode;
  textMode: TextMode;
  workspaceMode: WorkspaceMode;
};

const DEFAULT_SETTINGS: UserSettings = {
  accentMode: "ink",
  critiqueMode: "coach",
  motionMode: "gentle",
  previewMode: "balanced",
  surfaceMode: "bright",
  textMode: "standard",
  workspaceMode: "spacious",
};

export default function Home() {
  const [goal, setGoal] = useState<Goal>("realistic");
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [result, setResult] = useState<AnalysisRecord | null>(null);
  const [previousResult, setPreviousResult] = useState<AnalysisRecord | null>(null);
  const [error, setError] = useState("");
  const [dailyPrompt, setDailyPrompt] = useState<string>(DAILY_PROMPTS[0]);
  const [didRequestGoalSwap, setDidRequestGoalSwap] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [didHydrateSettings, setDidHydrateSettings] = useState(false);
  const goalRef = useRef<HTMLSelectElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { accentMode, critiqueMode, motionMode, previewMode, surfaceMode, textMode, workspaceMode } = settings;

  const statusText = useMemo(() => {
    if (isPreparing) {
      return "Reading image";
    }

    if (isAnalyzing) {
      return "Analyzing";
    }

    if (upload) {
      return "Ready";
    }

    return "No image";
  }, [isAnalyzing, isPreparing, upload]);

  const isCompact = workspaceMode === "compact";
  const isStill = motionMode === "still";
  const accent = ACCENTS[accentMode];
  const chromeStyle = {
    "--accent": accent.color,
    "--accent-soft": accent.soft,
  } as CSSProperties;

  useEffect(() => {
    const loadSettings = window.setTimeout(() => {
      setSettings(readSavedSettings());
      setDidHydrateSettings(true);
      setDailyPrompt(getTodaysPrompt());
    }, 0);

    return () => window.clearTimeout(loadSettings);
  }, []);

  useEffect(() => {
    if (!didHydrateSettings) {
      return;
    }

    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [didHydrateSettings, settings]);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError("");
    setResult(null);
    setPreviousResult(null);
    setDidRequestGoalSwap(false);
    setIsPreparing(true);

    try {
      const prepared = await prepareImage(file);
      setUpload({
        fileName: file.name,
        imageHash: prepared.imageHash,
        previewUrl: prepared.dataUrl,
        metrics: prepared.metrics,
      });
    } catch (caught) {
      setUpload(null);
      setError(caught instanceof Error ? caught.message : "The image could not be prepared.");
    } finally {
      setIsPreparing(false);
    }
  }

  function resetUpload() {
    setUpload(null);
    setResult(null);
    setPreviousResult(null);
    setDidRequestGoalSwap(false);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function analyze() {
    if (!upload || isPreparing || isAnalyzing) {
      return;
    }

    setError("");
    const priorResult = result;

    if (priorResult) {
      setPreviousResult(priorResult);
      setResult(null);
    }

    setIsAnalyzing(true);

    try {
      const cacheKey = getAnalysisCacheKey(upload.imageHash, goal);
      const cachedResponse = readCachedAnalysis(cacheKey);

      await wait(cachedResponse ? 120 : 260);

      const response =
        cachedResponse ??
        analyzeWithCache({
          goal,
          imageHash: upload.imageHash,
          metrics: upload.metrics,
        });

      writeCachedAnalysis(cacheKey, response);
      setResult({
        goal,
        response: cachedResponse ? { ...cachedResponse, cached: true } : response,
      });
      setDidRequestGoalSwap(false);
    } catch (caught) {
      if (priorResult) {
        setResult(priorResult);
        setPreviousResult(null);
      }

      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function tryDifferentGoal() {
    const currentIndex = GOALS.indexOf(goal);
    const nextGoal = GOALS[(currentIndex + 1) % GOALS.length];

    setGoal(nextGoal);
    setDidRequestGoalSwap(true);
    window.setTimeout(() => goalRef.current?.focus(), 0);
  }

  return (
    <main
      style={chromeStyle}
      className={[
        "min-h-screen px-4 py-5 text-[#161719] transition-colors duration-300 sm:px-7 lg:px-10",
        surfaceMode === "soft" ? "bg-[#f5f7fb]/55" : "",
        textMode === "large" ? "text-[17px]" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-[#dededb] pb-4">
          <Link className="text-[1.85rem] font-semibold leading-none tracking-normal" href="/">
            DrawCoach
          </Link>
          <span className="rounded-full border border-[#dededb] bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#59606a] shadow-[0_8px_30px_rgba(22,23,25,0.04)]">
            {statusText}
          </span>
        </header>

        <section className="mt-5 flex flex-col gap-2 border-b border-[#eeeeeb] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            Today&apos;s Prompt
          </p>
          <p className="max-w-2xl text-sm leading-6 text-[#4b525b] sm:text-right">{dailyPrompt}</p>
        </section>

        <section className="grid flex-1 gap-9 py-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:py-12">
          <div className={["max-w-xl", isStill ? "" : "animate-[fadeIn_360ms_ease-out]"].join(" ")}>
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-normal text-[#161719] sm:text-6xl lg:text-[4.85rem]">
              Fast notes for your next drawing pass.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#555c65] sm:text-lg">
              Upload a sketch, choose the direction, and get a small critique you can act on immediately.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-md border border-[#dededb] bg-[#dededb] text-sm">
              <Step label="Upload" active={Boolean(upload)} />
              <Step label="Analyze" active={isAnalyzing || Boolean(result || previousResult)} />
              <Step label="Fix list" active={Boolean(result || previousResult)} />
            </div>
          </div>

          <div className={["space-y-5", isStill ? "" : "animate-[fadeIn_420ms_ease-out]"].join(" ")}>
            <label
              className={[
                "group block cursor-pointer rounded-lg border bg-white p-3 transition duration-200",
                isDragging
                  ? "border-[var(--accent)] shadow-[0_24px_70px_rgba(25,70,210,0.14)]"
                  : "border-[#dededb] shadow-[0_18px_60px_rgba(22,23,25,0.06)] hover:border-[var(--accent)] hover:shadow-[0_22px_70px_rgba(22,23,25,0.09)]",
              ].join(" ")}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => {
                setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                void handleFile(event.dataTransfer.files[0]);
              }}
            >
              <input
                ref={inputRef}
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  void handleFile(event.target.files?.[0]);
                }}
              />
              <div
                className={[
                  "relative flex items-center justify-center overflow-hidden rounded-md bg-[#f4f5f6]",
                  isCompact
                    ? "min-h-[14rem] sm:min-h-[16rem]"
                    : previewMode === "large"
                      ? "min-h-[23rem] sm:min-h-[28rem]"
                      : "min-h-[19rem] sm:min-h-[22rem]",
                ].join(" ")}
              >
                {upload ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`Uploaded drawing: ${upload.fileName}`}
                    className="h-full max-h-[28rem] w-full object-contain"
                    src={upload.previewUrl}
                  />
                ) : (
                  <div className="px-8 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#d8dbdf] bg-white text-[var(--accent)] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--accent)]">
                      <UploadIcon />
                    </div>
                    <p className="text-lg font-semibold">
                      {isDragging ? "Drop it here" : "Upload a drawing"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#626975]">
                      JPG, PNG, or WebP. DrawCoach resizes it locally before analysis.
                    </p>
                  </div>
                )}
              </div>
              {upload ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#34383e]">{upload.fileName}</p>
                    <p className="mt-1 text-xs text-[#737982]">
                      Resized to {upload.metrics.width} x {upload.metrics.height}px for analysis.
                    </p>
                  </div>
                  <button
                    className="rounded-md border border-[#d8dce1] px-3 py-2 text-xs font-semibold text-[#34383e] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10"
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      resetUpload();
                    }}
                  >
                    Replace
                  </button>
                </div>
              ) : null}
            </label>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#34383e]">Goal</span>
                <select
                  ref={goalRef}
                  className="h-12 w-full rounded-md border border-[#cfd3d7] bg-white px-3 text-sm font-semibold text-[#161719] outline-none transition hover:border-[#aeb6c0] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
                  value={goal}
                  onChange={(event) => {
                    setGoal(event.target.value as Goal);
                    setDidRequestGoalSwap(false);
                  }}
                >
                  {GOALS.map((goalOption) => (
                    <option key={goalOption} value={goalOption}>
                      {titleCase(goalOption)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="mt-auto inline-flex h-12 min-w-32 items-center justify-center rounded-md bg-[var(--accent)] px-7 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(25,70,210,0.22)] transition duration-200 hover:-translate-y-0.5 hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#aab4c9] disabled:shadow-none"
                type="button"
                disabled={!upload || isPreparing || isAnalyzing}
                onClick={() => {
                  void analyze();
                }}
              >
                {isAnalyzing ? "Analyzing" : "Analyze"}
              </button>
            </div>

            {upload && (result || previousResult) ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="rounded-md border border-[#d8dce1] bg-white px-3 py-2 text-xs font-semibold text-[#34383e] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    void analyze();
                  }}
                >
                  Analyze Again
                </button>
                <button
                  className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)] transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={isAnalyzing}
                  onClick={tryDifferentGoal}
                >
                  Try this with a different goal
                </button>
                {didRequestGoalSwap ? (
                  <span className="text-xs font-medium text-[#68707b]">
                    Goal changed to {titleCase(goal)}. Press Analyze when ready.
                  </span>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <p className="animate-[fadeIn_220ms_ease-out] rounded-md border border-[#f1b7b7] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#9d2525]">
                {error}
              </p>
            ) : null}

            {upload && (result || previousResult || isAnalyzing) ? (
              <SessionWorkbench
                compact={isCompact}
                current={result}
                isAnalyzing={isAnalyzing}
                mode={critiqueMode}
                previous={previousResult}
                still={isStill}
                upload={upload}
              />
            ) : null}
          </div>
        </section>
      </div>
      <DrawCoachMenu
        isOpen={isSettingsOpen}
        accentMode={accentMode}
        critiqueMode={critiqueMode}
        motionMode={motionMode}
        previewMode={previewMode}
        setAccentMode={(mode) => setSettings((current) => ({ ...current, accentMode: mode }))}
        setCritiqueMode={(mode) => setSettings((current) => ({ ...current, critiqueMode: mode }))}
        setIsOpen={setIsSettingsOpen}
        setMotionMode={(mode) => setSettings((current) => ({ ...current, motionMode: mode }))}
        setPreviewMode={(mode) => setSettings((current) => ({ ...current, previewMode: mode }))}
        setSurfaceMode={(mode) => setSettings((current) => ({ ...current, surfaceMode: mode }))}
        setTextMode={(mode) => setSettings((current) => ({ ...current, textMode: mode }))}
        setWorkspaceMode={(mode) => setSettings((current) => ({ ...current, workspaceMode: mode }))}
        surfaceMode={surfaceMode}
        textMode={textMode}
        workspaceMode={workspaceMode}
      />
    </main>
  );
}

function Step({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="bg-white px-3 py-3">
      <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#737982]">{label}</p>
      <div className="mt-2 h-1.5 rounded-full bg-[#e8eaee]">
        <div
          className={[
            "h-full rounded-full transition-all duration-300",
            active ? "w-full bg-[var(--accent)]" : "w-0 bg-[var(--accent)]",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

function SessionWorkbench({
  compact,
  current,
  isAnalyzing,
  mode,
  previous,
  still,
  upload,
}: {
  compact: boolean;
  current: AnalysisRecord | null;
  isAnalyzing: boolean;
  mode: CritiqueMode;
  previous: AnalysisRecord | null;
  still: boolean;
  upload: UploadState;
}) {
  const showPrevious = Boolean(previous);

  return (
    <section
      className={[
        "grid gap-5 rounded-lg border border-[#dededb] bg-white shadow-[0_22px_70px_rgba(22,23,25,0.08)] lg:grid-cols-[0.82fr_1.18fr]",
        compact ? "p-4" : "p-5",
        still ? "" : "animate-[fadeIn_280ms_ease-out]",
      ].join(" ")}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#737982]">Before</p>
        <div className="mt-3 overflow-hidden rounded-md bg-[#f4f5f6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`Uploaded drawing: ${upload.fileName}`}
            className="max-h-[22rem] w-full object-contain"
            src={upload.previewUrl}
          />
        </div>
        <p className="mt-3 truncate text-xs font-medium text-[#68707b]">{upload.fileName}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#737982]">
              After
            </p>
            <h2 className="mt-1 text-lg font-semibold">Feedback</h2>
          </div>
          {current?.response.cached ? (
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              Cached
            </span>
          ) : null}
        </div>

        {showPrevious && previous ? (
          <FeedbackPanel label="Previous" mode={mode} record={previous} subdued />
        ) : null}

        {current ? (
          <FeedbackPanel label={showPrevious ? "New" : "New feedback"} mode={mode} record={current} />
        ) : isAnalyzing ? (
          <LoadingFeedback label={showPrevious ? "New" : "New feedback"} />
        ) : null}
      </div>
    </section>
  );
}

function FeedbackPanel({
  label,
  mode,
  record,
  subdued = false,
}: {
  label: string;
  mode: CritiqueMode;
  record: AnalysisRecord;
  subdued?: boolean;
}) {
  const { response } = record;

  return (
    <article
      className={[
        "rounded-md border p-4 transition",
        subdued ? "border-[#e7e8ea] bg-[#fafafa] opacity-85" : "border-[var(--accent)]/20 bg-white",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            {label} / {titleCase(record.goal)}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#34383e]">{response.summary}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
          {response.improvements.length} fixes
        </span>
      </div>

      <ol className={["mt-4", mode === "checklist" ? "space-y-2" : "space-y-3"].join(" ")}>
        {response.improvements.map((improvement, index) => (
          <li
            className={[
              "grid gap-3 border-t border-[#ececea] sm:grid-cols-[1.75rem_1fr]",
              mode === "checklist" ? "pt-3" : "pt-4",
            ].join(" ")}
            key={`${improvement.fix}-${index}`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
              {index + 1}
            </span>
            <div>
              {mode === "checklist" ? (
                <>
                  <p className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold leading-6 text-[var(--accent)]">
                    {improvement.fix}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#5f646b]">
                    {improvement.what} {improvement.why}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#161719]">{improvement.what}</p>
                  <p className="mt-1 text-sm leading-6 text-[#5f646b]">{improvement.why}</p>
                  <p className="mt-2 rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold leading-6 text-[var(--accent)]">
                    Small fix: {improvement.fix}
                  </p>
                </>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-md border border-[var(--accent)]/15 bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold leading-6 text-[var(--accent)]">
        {response.nextStep}
      </p>
    </article>
  );
}

function LoadingFeedback({ label }: { label: string }) {
  return (
    <article className="rounded-md border border-[#e7e8ea] bg-[#fafafa] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
        {label}
      </p>
      <div className="mt-4 space-y-3">
        <div className="h-3 w-4/5 rounded-full bg-[#e4e7ec]" />
        <div className="h-3 w-3/5 rounded-full bg-[#e4e7ec]" />
        <div className="h-20 rounded-md bg-[#eef0f4]" />
      </div>
    </article>
  );
}

function DrawCoachMenu({
  accentMode,
  critiqueMode,
  isOpen,
  motionMode,
  previewMode,
  setAccentMode,
  setCritiqueMode,
  setIsOpen,
  setMotionMode,
  setPreviewMode,
  setSurfaceMode,
  setTextMode,
  setWorkspaceMode,
  surfaceMode,
  textMode,
  workspaceMode,
}: {
  accentMode: AccentMode;
  critiqueMode: CritiqueMode;
  isOpen: boolean;
  motionMode: MotionMode;
  previewMode: PreviewMode;
  setAccentMode: (mode: AccentMode) => void;
  setCritiqueMode: (mode: CritiqueMode) => void;
  setIsOpen: (isOpen: boolean) => void;
  setMotionMode: (mode: MotionMode) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setSurfaceMode: (mode: SurfaceMode) => void;
  setTextMode: (mode: TextMode) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  surfaceMode: SurfaceMode;
  textMode: TextMode;
  workspaceMode: WorkspaceMode;
}) {
  return (
    <div className="fixed bottom-5 left-5 z-40">
      {isOpen ? (
        <div className="mb-3 max-h-[calc(100vh-5.5rem)] w-[22rem] max-w-[calc(100vw-2.5rem)] overflow-y-auto rounded-lg border border-[#d9dde3] bg-white p-4 shadow-[0_24px_80px_rgba(22,23,25,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#161719]">Customize DrawCoach</p>
              <p className="mt-1 text-xs leading-5 text-[#626975]">
                Change how the workspace looks and how feedback is shown.
              </p>
            </div>
            <button
              aria-label="Close settings"
              className="rounded-md px-2 py-1 text-sm font-semibold text-[#737982] transition hover:bg-[#f3f5f8] hover:text-[#161719] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              x
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <SettingGroup label="Accent">
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(ACCENTS) as AccentMode[]).map((accentKey) => (
                  <button
                    aria-label={`${ACCENTS[accentKey].name} accent`}
                    className={[
                      "flex h-10 items-center justify-center rounded-md border bg-white transition focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10",
                      accentMode === accentKey ? "border-[#161719]" : "border-[#e0e4ea] hover:border-[#aeb6c0]",
                    ].join(" ")}
                    key={accentKey}
                    type="button"
                    onClick={() => setAccentMode(accentKey)}
                  >
                    <span
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: ACCENTS[accentKey].color }}
                    />
                  </button>
                ))}
              </div>
            </SettingGroup>

            <SettingGroup label="Layout">
              <SegmentButton
                active={workspaceMode === "spacious"}
                label="Spacious"
                onClick={() => setWorkspaceMode("spacious")}
              />
              <SegmentButton
                active={workspaceMode === "compact"}
                label="Compact"
                onClick={() => setWorkspaceMode("compact")}
              />
            </SettingGroup>

            <SettingGroup label="Text size">
              <SegmentButton
                active={textMode === "standard"}
                label="Standard"
                onClick={() => setTextMode("standard")}
              />
              <SegmentButton
                active={textMode === "large"}
                label="Larger"
                onClick={() => setTextMode("large")}
              />
            </SettingGroup>

            <SettingGroup label="Image preview">
              <SegmentButton
                active={previewMode === "balanced"}
                label="Balanced"
                onClick={() => setPreviewMode("balanced")}
              />
              <SegmentButton
                active={previewMode === "large"}
                label="Expanded"
                onClick={() => setPreviewMode("large")}
              />
            </SettingGroup>

            <SettingGroup label="Critique view">
              <SegmentButton
                active={critiqueMode === "coach"}
                label="Coach"
                onClick={() => setCritiqueMode("coach")}
              />
              <SegmentButton
                active={critiqueMode === "checklist"}
                label="Checklist"
                onClick={() => setCritiqueMode("checklist")}
              />
            </SettingGroup>

            <SettingGroup label="Page feel">
              <SegmentButton
                active={surfaceMode === "bright"}
                label="Bright"
                onClick={() => setSurfaceMode("bright")}
              />
              <SegmentButton
                active={surfaceMode === "soft"}
                label="Soft"
                onClick={() => setSurfaceMode("soft")}
              />
            </SettingGroup>

            <SettingGroup label="Animation">
              <SegmentButton
                active={motionMode === "gentle"}
                label="Gentle"
                onClick={() => setMotionMode("gentle")}
              />
              <SegmentButton
                active={motionMode === "still"}
                label="Still"
                onClick={() => setMotionMode("still")}
              />
            </SettingGroup>
          </div>
        </div>
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-label="Open DrawCoach settings"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#202124] font-serif text-[1.08rem] font-semibold italic leading-none text-white shadow-[0_10px_28px_rgba(22,23,25,0.25),inset_0_0_0_1px_rgba(255,255,255,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#202124] hover:shadow-[0_14px_34px_rgba(22,23,25,0.28),inset_0_0_0_1px_rgba(255,255,255,0.18)] focus:outline-none focus:ring-4 focus:ring-[#1946d2]/20"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        D
      </button>
    </div>
  );
}

function SettingGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#737982]">{label}</p>
      <div className="grid grid-cols-2 gap-1 rounded-md border border-[#e0e4ea] bg-[#f6f7f9] p-1">
        {children}
      </div>
    </div>
  );
}

function SegmentButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={[
        "rounded px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#1946d2]/10",
        active
          ? "bg-white text-[var(--accent)] shadow-[0_4px_16px_rgba(22,23,25,0.08)]"
          : "text-[#59606a] hover:bg-white/70 hover:text-[#161719]",
      ].join(" ")}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 16V5m0 0 4.25 4.25M12 5 7.75 9.25M5 19h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTodaysPrompt(): string {
  const now = new Date();
  const dayKey = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000,
  );

  return DAILY_PROMPTS[dayKey % DAILY_PROMPTS.length];
}

function getAnalysisCacheKey(imageHash: string, goal: Goal): string {
  return `${imageHash}:${goal}`;
}

function readCachedAnalysis(cacheKey: string): AnalyzeResponse | null {
  try {
    const rawCache = window.localStorage.getItem(ANALYSIS_CACHE_KEY);

    if (!rawCache) {
      return null;
    }

    const cache = JSON.parse(rawCache) as Record<
      string,
      { expiresAt: number; response: AnalyzeResponse }
    >;
    const cached = cache[cacheKey];

    if (!cached) {
      return null;
    }

    if (cached.expiresAt <= Date.now()) {
      delete cache[cacheKey];
      window.localStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return { ...cached.response, cached: true };
  } catch {
    window.localStorage.removeItem(ANALYSIS_CACHE_KEY);
    return null;
  }
}

function writeCachedAnalysis(cacheKey: string, response: AnalyzeResponse): void {
  try {
    const rawCache = window.localStorage.getItem(ANALYSIS_CACHE_KEY);
    const cache = rawCache
      ? (JSON.parse(rawCache) as Record<string, { expiresAt: number; response: AnalyzeResponse }>)
      : {};
    const entries = Object.entries(cache)
      .filter(([, cached]) => cached.expiresAt > Date.now())
      .slice(-(MAX_STORED_ANALYSES - 1));
    const cleanResponse = { ...response, cached: false };

    cache[cacheKey] = {
      expiresAt: Date.now() + ANALYSIS_CACHE_TTL_MS,
      response: cleanResponse,
    };

    window.localStorage.setItem(
      ANALYSIS_CACHE_KEY,
      JSON.stringify(Object.fromEntries([...entries, [cacheKey, cache[cacheKey]]])),
    );
  } catch {
    window.localStorage.removeItem(ANALYSIS_CACHE_KEY);
  }
}

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function readSavedSettings(): UserSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const rawSettings = window.localStorage.getItem(SETTINGS_KEY);

    if (!rawSettings) {
      return DEFAULT_SETTINGS;
    }

    const savedSettings = JSON.parse(rawSettings) as Partial<UserSettings>;

    return {
      accentMode:
        savedSettings.accentMode && savedSettings.accentMode in ACCENTS
          ? savedSettings.accentMode
          : DEFAULT_SETTINGS.accentMode,
      critiqueMode:
        savedSettings.critiqueMode === "coach" || savedSettings.critiqueMode === "checklist"
          ? savedSettings.critiqueMode
          : DEFAULT_SETTINGS.critiqueMode,
      motionMode:
        savedSettings.motionMode === "gentle" || savedSettings.motionMode === "still"
          ? savedSettings.motionMode
          : DEFAULT_SETTINGS.motionMode,
      previewMode:
        savedSettings.previewMode === "balanced" || savedSettings.previewMode === "large"
          ? savedSettings.previewMode
          : DEFAULT_SETTINGS.previewMode,
      surfaceMode:
        savedSettings.surfaceMode === "bright" || savedSettings.surfaceMode === "soft"
          ? savedSettings.surfaceMode
          : DEFAULT_SETTINGS.surfaceMode,
      textMode:
        savedSettings.textMode === "standard" || savedSettings.textMode === "large"
          ? savedSettings.textMode
          : DEFAULT_SETTINGS.textMode,
      workspaceMode:
        savedSettings.workspaceMode === "spacious" || savedSettings.workspaceMode === "compact"
          ? savedSettings.workspaceMode
          : DEFAULT_SETTINGS.workspaceMode,
    };
  } catch {
    window.localStorage.removeItem(SETTINGS_KEY);
    return DEFAULT_SETTINGS;
  }
}
