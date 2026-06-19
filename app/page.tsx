"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { prepareImage } from "@/lib/client-image";
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

  async function analyze() {
    if (!upload || isPreparing || isAnalyzing) {
      return;
    }

    setError("");
    setResult(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          metrics: upload.metrics,
        }),
      });

      const payload = (await response.json()) as AnalyzeResponse | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload && payload.error ? payload.error : "Analysis failed.");
      }

      setResult(payload as AnalyzeResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-6 text-[#161719] sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-[#dededb] pb-5">
          <Link className="text-[1.7rem] font-semibold leading-none tracking-normal" href="/">
            DrawNest
          </Link>
          <span className="rounded-full border border-[#dededb] bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#6c7178]">
            {statusText}
          </span>
        </header>

        <section className="grid flex-1 gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-14">
          <div className="max-w-xl">
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-normal text-[#161719] sm:text-6xl lg:text-7xl">
              Simple critique for rough drawings.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#5f646b] sm:text-lg">
              Upload a sketch, choose a goal, and get a short list of fixes you can try right away.
            </p>
          </div>

          <div className="space-y-6">
            <label
              className="group block cursor-pointer rounded-lg border border-dashed border-[#bfc4ca] bg-white p-4 transition duration-200 hover:border-[#1946d2] hover:shadow-[0_18px_55px_rgba(22,23,25,0.08)]"
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
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
              <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-md bg-[#f4f5f6]">
                {upload ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`Uploaded drawing: ${upload.fileName}`}
                    className="h-full max-h-[28rem] w-full object-contain"
                    src={upload.previewUrl}
                  />
                ) : (
                  <div className="px-8 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#d8dbdf] bg-white text-[#1946d2] transition duration-200 group-hover:-translate-y-0.5">
                      <UploadIcon />
                    </div>
                    <p className="text-lg font-semibold">Upload a drawing</p>
                    <p className="mt-2 text-sm leading-6 text-[#6c7178]">
                      Drop an image here or click to choose one. It is resized locally before analysis.
                    </p>
                  </div>
                )}
              </div>
              {upload ? (
                <p className="mt-3 truncate text-sm text-[#6c7178]">{upload.fileName}</p>
              ) : null}
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#34383e]">Goal</span>
                <select
                  className="h-12 w-full rounded-md border border-[#cfd3d7] bg-white px-3 text-sm font-medium text-[#161719] outline-none transition focus:border-[#1946d2] focus:ring-4 focus:ring-[#1946d2]/10"
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
                className="mt-auto inline-flex h-12 items-center justify-center rounded-md bg-[#1946d2] px-7 text-sm font-semibold text-white transition duration-200 hover:bg-[#0f2f92] focus:outline-none focus:ring-4 focus:ring-[#1946d2]/20 disabled:cursor-not-allowed disabled:bg-[#aab4c9]"
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
    </main>
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
