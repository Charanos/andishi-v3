import { NextRequest, NextResponse } from "next/server";
import { listPublicOpenings } from "@/lib/services/careers/openings";

type JobKind = "freelance" | "internal" | "outsourced";

function parseJobKind(value: string | null): JobKind | undefined {
  return value === "freelance" || value === "internal" || value === "outsourced"
    ? value
    : undefined;
}

/** GET /api/careers - public list of published (status=open) job openings, optional ?kind=freelance|internal|outsourced. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = parseJobKind(searchParams.get("kind"));

  const openings = await listPublicOpenings(kind ? { kind } : {});
  return NextResponse.json({ openings });
}
