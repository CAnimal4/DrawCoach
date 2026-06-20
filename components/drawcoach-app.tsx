"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { BrandLink } from "@/components/brand-link";
import {
  buildShareData,
  buildShareLinks,
  SHARE_PROMO_DISMISSED_KEY,
} from "@/lib/share";
import { prepareImage } from "@/lib/client-image";
import { analyzeWithCache } from "@/lib/critique";
import { buildFeedbackMailto } from "@/lib/feedback";
import { DRAWCOACH_LOGO_PATH } from "@/lib/site";
import { GOALS, type AnalyzeResponse, type Goal, type ImageMetrics } from "@/lib/types";

type UploadState = {
  fileName: string;
  previewUrl: string;
  metrics: ImageMetrics;
};

type AccentMode = "ink" | "graphite" | "teal" | "plum";
type WorkspaceMode = "spacious" | "compact";
type TextMode = "standard" | "large";
type MotionMode = "gentle" | "still";

const ACCENTS: Record<AccentMode, { color: string; soft: string; name: string }> = {
  ink: { color: "#1946d2", soft: "#eef3ff", name: "Ink" },
  graphite: { color: "#202124", soft: "#f0f1f3", name: "Graphite" },
  teal: { color: "#087f76", soft: "#e9f7f5", name: "Teal" },
  plum: { color: "#7a2e83", soft: "#f7edf8", name: "Plum" },
};

export function DrawCoachApp() {
  const [goal, setGoal] = useState<Goal>("realistic");
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareFallbackOpen, setShareFallbackOpen] = useState(false);
  const [accentMode, setAccentMode] = useState<AccentMode>("ink");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("spacious");
  const [textMode, setTextMode] = useState<TextMode>("standard");
  const [motionMode, setMotionMode] = useState<MotionMode>("gentle");
  const [isPromoDismissed, setIsPromoDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shareLinks = useMemo(() => buildShareLinks(), []);
  const accent = ACCENTS[accentMode];
  const isCompact = workspaceMode === "compact";
  const isStill = motionMode === "still";

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

  useEffect(() => {
    const checkPromo = window.setTimeout(() => {
      setIsPromoDismissed(window.localStorage.getItem(SHARE_PROMO_DISMISSED_KEY) === "true");
    }, 0);

    return () => window.clearTimeout(checkPromo);
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError("");
    setShareMessage("");
    setResult(null);
    setIsPreparing(true);

    try {
      const prepared = await prepareImage(file);
      setUpload({
        fileName: file.name,
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
    setError("");
    setShareMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function dismissPromo() {
    window.localStorage.setItem(SHARE_PROMO_DISMISSED_KEY, "true");
    setIsPromoDismissed(true);
  }

  async function shareDrawCoach() {
    setShareMessage("");

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(buildShareData());
        setShareMessage("Thanks for sharing DrawCoach.");
        return;
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
      }
    }

    setShareFallbackOpen(true);
    setShareMessage("Choose email or text to share DrawCoach.");
  }

  async function analyze() {
    if (!upload || isPreparing || isAnalyzing) {
      return;
    }

    setError("");
    setResult(null);
    setIsAnalyzing(true);

    try {
      await wait(180);
      setResult(analyzeWithCache({ goal, metrics: upload.metrics }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main
      style={{ "--accent": accent.color, "--accent-soft": accent.soft } as CSSProperties}
      className={[
        "min-h-screen px-5 py-6 text-[#161719] sm:px-8 lg:px-12",
        textMode === "large" ? "text-[17px]" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[#dededb] pb-5">
          <BrandLink />
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {isPromoDismissed ? (
              <button
                className="whitespace-nowrap rounded-full border border-[var(--accent)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)] transition hover:bg-[var(--accent-soft)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10"
                type="button"
                onClick={() => {
                  void shareDrawCoach();
                }}
              >
                Share
              </button>
            ) : null}
            <Link
              className="whitespace-nowrap rounded-full border border-[#dededb] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#59606a] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10"
              href="/about"
            >
              About
            </Link>
            <span className="whitespace-nowrap rounded-full border border-[#dededb] bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#6c7178]">
              {statusText}
            </span>
          </div>
        </header>

        {!isPromoDismissed ? (
          <section className="mt-5 flex flex-col gap-3 rounded-lg border border-[#d9dfee] bg-white px-4 py-3 shadow-[0_14px_45px_rgba(22,23,25,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#161719]">Share DrawCoach with a friend</p>
              <p className="mt-1 text-sm leading-6 text-[#5f646b]">
                Send the link by email or text so someone else can try quick drawing feedback.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
                type="button"
                onClick={() => {
                  void shareDrawCoach();
                }}
              >
                Share
              </button>
              <button
                className="rounded-md border border-[#d8dce1] bg-white px-4 py-2 text-sm font-semibold text-[#34383e] transition hover:border-[#1946d2] hover:text-[#1946d2] focus:outline-none focus:ring-4 focus:ring-[#1946d2]/10"
                type="button"
                onClick={dismissPromo}
              >
                Dismiss
              </button>
            </div>
          </section>
        ) : null}

        {shareMessage ? (
          <p className="mt-4 rounded-md border border-[#d9dfee] bg-[#f7f9ff] px-4 py-3 text-sm font-medium text-[#1946d2]">
            {shareMessage}
          </p>
        ) : null}

        {isShareFallbackOpen ? (
          <ShareFallback links={shareLinks} onClose={() => setShareFallbackOpen(false)} />
        ) : null}

        <section className="grid flex-1 gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-14">
          <div className={["max-w-xl", isStill ? "" : "animate-[fadeIn_360ms_ease-out]"].join(" ")}>
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-normal text-[#161719] sm:text-6xl lg:text-7xl">
              Clear next steps for better drawings.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#5f646b] sm:text-lg">
              Upload a sketch, choose a goal, and get simple fixes you can try right away.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-md border border-[#dededb] bg-[#dededb] text-sm">
              <Step label="Upload" active={Boolean(upload)} />
              <Step label="Analyze" active={isAnalyzing || Boolean(result)} />
              <Step label="Fix list" active={Boolean(result)} />
            </div>
          </div>

          <div className="space-y-6">
            <label
              className={[
                "group block cursor-pointer rounded-lg border border-dashed bg-white p-4 transition duration-200",
                isDragging
                  ? "border-[var(--accent)] shadow-[0_18px_55px_rgba(25,70,210,0.12)]"
                  : "border-[#bfc4ca] hover:border-[var(--accent)] hover:shadow-[0_18px_55px_rgba(22,23,25,0.08)]",
              ].join(" ")}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
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
                  "flex items-center justify-center overflow-hidden rounded-md bg-[#f4f5f6]",
                  isCompact ? "min-h-60" : "min-h-72",
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
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#d8dbdf] bg-white text-[var(--accent)] transition duration-200 group-hover:-translate-y-0.5">
                      <UploadIcon />
                    </div>
                    <p className="text-lg font-semibold">
                      {isDragging ? "Drop it here" : "Upload a drawing"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#6c7178]">
                      Drop an image here or click to choose one. It is resized locally before analysis.
                    </p>
                  </div>
                )}
              </div>
              {upload ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#34383e]">{upload.fileName}</p>
                    <p className="mt-1 text-xs text-[#737982]">
                      Resized to {upload.metrics.width} x {upload.metrics.height}px.
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

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#34383e]">Goal</span>
                <select
                  className="h-12 w-full rounded-md border border-[#cfd3d7] bg-white px-3 text-sm font-medium text-[#161719] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value as Goal)}
                >
                  {GOALS.map((goalOption) => (
                    <option key={goalOption} value={goalOption}>
                      {titleCase(goalOption)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="mt-auto inline-flex h-12 items-center justify-center rounded-md bg-[var(--accent)] px-7 text-sm font-semibold text-white transition duration-200 hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:bg-[#aab4c9]"
                type="button"
                disabled={!upload || isPreparing || isAnalyzing}
                onClick={() => {
                  void analyze();
                }}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
            </div>

            {error ? (
              <p className="rounded-md border border-[#f1b7b7] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#9d2525]">
                {error}
              </p>
            ) : null}

            {result ? <ResultCard result={result} /> : null}
          </div>
        </section>
      </div>

      <DrawCoachMenu
        accentMode={accentMode}
        isOpen={isMenuOpen}
        motionMode={motionMode}
        setAccentMode={setAccentMode}
        setIsOpen={setIsMenuOpen}
        setMotionMode={setMotionMode}
        setTextMode={setTextMode}
        setWorkspaceMode={setWorkspaceMode}
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
            "h-full rounded-full bg-[#1946d2] transition-all duration-300",
            active ? "w-full" : "w-0",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

function ShareFallback({
  links,
  onClose,
}: {
  links: ReturnType<typeof buildShareLinks>;
  onClose: () => void;
}) {
  return (
    <section className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-[#dededb] bg-white px-4 py-3 text-sm">
      <span className="font-medium text-[#34383e]">Share with:</span>
      <a
        className="rounded-md bg-[#1946d2] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0f2f92]"
        href={links.mailto}
      >
        Email
      </a>
      <a
        className="rounded-md border border-[#d8dce1] px-3 py-2 text-xs font-semibold text-[#34383e] transition hover:border-[#1946d2] hover:text-[#1946d2]"
        href={links.sms}
      >
        Text
      </a>
      <button
        className="ml-auto rounded-md px-3 py-2 text-xs font-semibold text-[#737982] transition hover:bg-[#f3f5f8] hover:text-[#161719]"
        type="button"
        onClick={onClose}
      >
        Close
      </button>
    </section>
  );
}

function ResultCard({ result }: { result: AnalyzeResponse }) {
  return (
    <section className="animate-[fadeIn_280ms_ease-out] rounded-lg border border-[#dededb] bg-white p-5 shadow-[0_22px_70px_rgba(22,23,25,0.08)]">
      <h2 className="text-lg font-semibold">Critique</h2>
      <p className="mt-3 text-sm leading-6 text-[#34383e]">{result.summary}</p>

      <ol className="mt-5 space-y-4">
        {result.improvements.map((improvement, index) => (
          <li className="border-t border-[#ececea] pt-4" key={`${improvement.fix}-${index}`}>
            <p className="text-sm font-semibold text-[#161719]">{improvement.what}</p>
            <p className="mt-1 text-sm leading-6 text-[#5f646b]">{improvement.why}</p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#1946d2]">
              Small fix: {improvement.fix}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DrawCoachMenu({
  accentMode,
  isOpen,
  motionMode,
  setAccentMode,
  setIsOpen,
  setMotionMode,
  setTextMode,
  setWorkspaceMode,
  textMode,
  workspaceMode,
}: {
  accentMode: AccentMode;
  isOpen: boolean;
  motionMode: MotionMode;
  setAccentMode: (mode: AccentMode) => void;
  setIsOpen: (isOpen: boolean) => void;
  setMotionMode: (mode: MotionMode) => void;
  setTextMode: (mode: TextMode) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  textMode: TextMode;
  workspaceMode: WorkspaceMode;
}) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackReplyEmail, setFeedbackReplyEmail] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");

  function openFeedbackDraft() {
    const mailto = buildFeedbackMailto({
      feedback: feedbackText,
      replyEmail: feedbackReplyEmail,
      pageUrl: window.location.href,
      userAgent: window.navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
    });

    window.location.href = mailto;
    setFeedbackStatus("Email draft opened; send it from your mail app.");
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-end gap-3 max-sm:flex-col max-sm:items-start">
      <div className="shrink-0">
        {isOpen ? (
          <div className="mb-3 max-h-[calc(100vh-5.5rem)] w-[23rem] max-w-[calc(100vw-2.5rem)] overflow-y-auto rounded-lg border border-[#d9dde3] bg-white p-4 shadow-[0_24px_80px_rgba(22,23,25,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#161719]">Customize DrawCoach</p>
                <p className="mt-1 text-xs leading-5 text-[#626975]">
                  Change the workspace feel and review app policies.
                </p>
              </div>
              <button
                aria-label="Close menu"
                className="rounded-md px-2 py-1 text-sm font-semibold text-[#737982] transition hover:bg-[#f3f5f8] hover:text-[#161719]"
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

            <div className="mt-5 border-t border-[#ececea] pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#737982]">Policies</p>
              <div className="mt-3 grid gap-2">
                <MenuLink href="/privacy" label="Privacy Policy" />
                <MenuLink href="/terms" label="Terms of Use" />
                <MenuLink href="/cookies" label="Cookie Policy" />
              </div>
            </div>

            <div className="mt-5 border-t border-[#ececea] pt-4">
              <button
                className="w-full rounded-md border border-[#d8dce1] px-3 py-2 text-left text-sm font-semibold text-[#34383e] transition hover:border-[#1946d2] hover:text-[#1946d2] focus:outline-none focus:ring-4 focus:ring-[#1946d2]/10"
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
              >
                Feedback
              </button>
            </div>
          </div>
        ) : null}

        <button
          aria-expanded={isOpen}
          aria-label="Open DrawCoach menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#202124] shadow-[0_10px_28px_rgba(22,23,25,0.25),inset_0_0_0_1px_rgba(255,255,255,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#202124] hover:shadow-[0_14px_34px_rgba(22,23,25,0.28),inset_0_0_0_1px_rgba(255,255,255,0.18)] focus:outline-none focus:ring-4 focus:ring-[#1946d2]/20"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Image
            alt=""
            aria-hidden="true"
            className="h-7 w-7 object-contain brightness-0 invert"
            height="28"
            src={DRAWCOACH_LOGO_PATH}
            width="28"
          />
        </button>
      </div>

      {isFeedbackOpen ? (
        <div className="w-[23rem] max-w-[calc(100vw-2.5rem)] rounded-lg border border-[#d9dde3] bg-white p-4 shadow-[0_24px_80px_rgba(22,23,25,0.18)] sm:max-w-[calc(100vw-27rem)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#161719]">Feedback</p>
              <p className="mt-1 text-xs leading-5 text-[#626975]">
                Opens your email app with a draft you can review and send.
              </p>
            </div>
            <button
              aria-label="Close feedback"
              className="rounded-md px-2 py-1 text-sm font-semibold text-[#737982] transition hover:bg-[#f3f5f8] hover:text-[#161719]"
              type="button"
              onClick={() => setIsFeedbackOpen(false)}
            >
              x
            </button>
          </div>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              openFeedbackDraft();
            }}
          >
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#737982]">
                Feedback
              </span>
              <textarea
                className="min-h-28 w-full resize-y rounded-md border border-[#d8dce1] bg-white px-3 py-2 text-sm leading-6 text-[#161719] outline-none transition placeholder:text-[#9aa1aa] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
                name="DrawCoach feedback"
                placeholder="What should DrawCoach improve?"
                required
                value={feedbackText}
                onChange={(event) => {
                  setFeedbackText(event.target.value);
                  setFeedbackStatus("");
                }}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#737982]">
                Reply email optional
              </span>
              <input
                className="h-10 w-full rounded-md border border-[#d8dce1] bg-white px-3 text-sm text-[#161719] outline-none transition placeholder:text-[#9aa1aa] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
                name="Reply email"
                placeholder="you@example.com"
                type="email"
                value={feedbackReplyEmail}
                onChange={(event) => {
                  setFeedbackReplyEmail(event.target.value);
                  setFeedbackStatus("");
                }}
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                className="rounded-md border border-[#d8dce1] bg-white px-3 py-2 text-sm font-semibold text-[#34383e] transition hover:border-[#1946d2] hover:text-[#1946d2] focus:outline-none focus:ring-4 focus:ring-[#1946d2]/10"
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
                type="submit"
              >
                Open email draft
              </button>
            </div>

            {feedbackStatus ? (
              <p className="rounded-md border border-[#d9dfee] bg-[#f7f9ff] px-3 py-2 text-xs font-medium leading-5 text-[#1946d2]">
                {feedbackStatus}
              </p>
            ) : null}
          </form>
        </div>
      ) : null}
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
        "rounded px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10",
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

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-md border border-[#d8dce1] px-3 py-2 text-sm font-semibold text-[#34383e] transition hover:border-[#1946d2] hover:text-[#1946d2]"
      href={href}
    >
      {label}
    </Link>
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

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}
