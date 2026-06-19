import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/responses";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return jsonError("A file is required.", 400, "file");
  }

  if (file.size > 5 * 1024 * 1024) {
    return jsonError("Files must be 5MB or smaller.", 400, "file");
  }

  return NextResponse.json(
    { error: "Blob storage is configured but upload persistence is not enabled yet." },
    { status: 501 },
  );
}

