import { NextResponse } from "next/server";
import { analyzeWithCache, isGoal, isImageMetrics } from "@/lib/critique";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  if (!isGoal(input.goal)) {
    return NextResponse.json({ error: "Choose a valid drawing goal." }, { status: 400 });
  }

  if (!isImageMetrics(input.metrics)) {
    return NextResponse.json({ error: "Image metrics are missing or invalid." }, { status: 400 });
  }

  return NextResponse.json(analyzeWithCache({ goal: input.goal, metrics: input.metrics }));
}
