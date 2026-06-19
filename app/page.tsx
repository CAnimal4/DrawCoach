"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { prepareImage } from "@/lib/client-image";
import { analyzeWithCache } from "@/lib/critique";
import { GOALS, type AnalyzeResponse, type Goal, type ImageMetrics } from "@/lib/types";

type UploadState = {
  fileName: string;
  previewUrl: string;
  metrics: ImageMetrics;
};

export default function Home() {
  const [goal, setGoal] = useState<Goal>("realistic");
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const selectedGoalLabel = titleCase(goal);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError("");
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
    if (upload?.previewUrl) {
      URL.revokeObjectURL(upload.previewUrl);
    }

    setUpload(null);
    setResult(null);
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
    setResult(null);
    setIsAnalyzing(true);

    try {
      setResult(analyzeWithCache({ goal, metrics: upload.metrics }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 text-[#161719] sm:px-7 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-[#dededb] pb-4">
          <Link className="text-[1.85rem] font-semibold leading-none tracking-normal" href="/">
            DrawCoach
          </Link>
          <span className="rounded-full border border-[#dededb] bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#59606a] shadow-[0_8px_30px_rgba(22,23,25,0.04)]">
            {statusText}
          </span>
        </header>

        <section className="grid flex-1 gap-9 py-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:py-12">
          <div className="max-w-xl animate-[fadeIn_360ms_ease-out]">
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-normal text-[#161719] sm:text-6xl lg:text-[4.85rem]">
              Fast notes for your next drawing pass.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#555c65] sm:text-lg">
              Upload a sketch, choose the direction, and get a small critique you can act on immediately.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-md border border-[#dededb] bg-[#dededb] text-sm">
              <Step label="Upload" active={Boolean(upload)} />
              <Step label={selectedGoalLabel} active />
              <Step label="Fix list" active={Boolean(result)} />
            </div>
          </div>

          <div className="space-y-5 animate-[fadeIn_420ms_ease-out]">
            <label
              className={[
                "group block cursor-pointer rounded-lg border bg-white p-3 transition duration-200",
                isDragging
                  ? "border-[#1946d2] shadow-[0_24px_70px_rgba(25,70,210,0.14)]"
                  : "border-[#dededb] shadow-[0_18px_60px_rgba(22,23,25,0.06)] hover:border-[#1946d2] hover:shadow-[0_22px_70px_rgba(22,23,25,0.09)]",
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
              <div className="relative flex min-h-[19rem] items-center justify-center overflow-hidden rounded-md bg-[#f4f5f6] sm:min-h-[22rem]">
                {upload ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`Uploaded drawing: ${upload.fileName}`}
                    className="h-full max-h-[28rem] w-full object-contain"
                    src={upload.previewUrl}
                  />
                ) : (
                  <div className="px-8 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#d8dbdf] bg-white text-[#1946d2] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[#1946d2]">
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
                    className="rounded-md border border-[#d8dce1] px-3 py-2 text-xs font-semibold text-[#34383e] transition hover:border-[#1946d2] hover:text-[#1946d2] focus:outline-none focus:ring-4 focus:ring-[#1946d2]/10"
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
                  className="h-12 w-full rounded-md border border-[#cfd3d7] bg-white px-3 text-sm font-semibold text-[#161719] outline-none transition hover:border-[#aeb6c0] focus:border-[#1946d2] focus:ring-4 focus:ring-[#1946d2]/10"
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
                className="mt-auto inline-flex h-12 min-w-32 items-center justify-center rounded-md bg-[#1946d2] px-7 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(25,70,210,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0f2f92] focus:outline-none focus:ring-4 focus:ring-[#1946d2]/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#aab4c9] disabled:shadow-none"
                type="button"
                disabled={!upload || isPreparing || isAnalyzing}
                onClick={() => {
                  void analyze();
                }}
              >
                {isAnalyzing ? "Analyzing" : "Analyze"}
              </button>
            </div>

            {error ? (
              <p className="animate-[fadeIn_220ms_ease-out] rounded-md border border-[#f1b7b7] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#9d2525]">
                {error}
              </p>
            ) : null}

            {result ? <ResultCard result={result} /> : null}
          </div>
        </section>
      </div>
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
            active ? "w-full bg-[#1946d2]" : "w-0 bg-[#1946d2]",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: AnalyzeResponse }) {
  return (
    <section className="animate-[fadeIn_280ms_ease-out] rounded-lg border border-[#dededb] bg-white p-5 shadow-[0_22px_70px_rgba(22,23,25,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Critique</h2>
          <p className="mt-2 text-sm leading-6 text-[#34383e]">{result.summary}</p>
        </div>
        <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#1946d2]">
          {result.improvements.length} fixes
        </span>
      </div>

      <ol className="mt-5 space-y-4">
        {result.improvements.map((improvement, index) => (
          <li className="grid gap-3 border-t border-[#ececea] pt-4 sm:grid-cols-[2rem_1fr]" key={`${improvement.fix}-${index}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f6fb] text-sm font-semibold text-[#1946d2]">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#161719]">{improvement.what}</p>
              <p className="mt-1 text-sm leading-6 text-[#5f646b]">{improvement.why}</p>
              <p className="mt-2 rounded-md bg-[#f6f8ff] px-3 py-2 text-sm font-semibold leading-6 text-[#1946d2]">
                Small fix: {improvement.fix}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
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
