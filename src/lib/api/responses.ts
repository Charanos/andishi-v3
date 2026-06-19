import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(error: string, status = 400, field?: string) {
  return NextResponse.json(field ? { error, field } : { error }, { status });
}

export function validationError(error: ZodError) {
  const issue = error.issues[0];
  return jsonError(issue?.message ?? "Invalid request.", 400, issue?.path.join("."));
}

export async function parseJson(req: Request) {
  return req.json().catch(() => null);
}

