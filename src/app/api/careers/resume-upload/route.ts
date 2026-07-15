import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { jsonError } from "@/lib/api/responses";
import { getClientIp } from "@/lib/api/request";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

/**
 * POST /api/careers/resume-upload
 *
 * Public, unauthenticated - applicants have no account. Rate-limited since
 * this is an anonymous write endpoint. Mirrors /api/upload's Vercel
 * Blob/local-fallback pattern but scoped to resume documents rather than
 * avatar images.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req) ?? "unknown";
  const { allowed } = await rateLimit("career-resume-upload", ip, {
    limit: 10,
    windowSeconds: 3600,
  });
  if (!allowed) return jsonError("Too many uploads. Please try again later.", 429);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return jsonError("A file is required.", 400, "file");
  }

  if (file.size > 5 * 1024 * 1024) {
    return jsonError("Files must be 5MB or smaller.", 400, "file");
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
    return jsonError("Only PDF, DOC, or DOCX files are allowed.", 400, "file");
  }

  try {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      if (process.env.NODE_ENV === "production") {
        console.error(
          "BLOB_READ_WRITE_TOKEN is not configured in production; resume upload is unavailable.",
        );
        return jsonError("File upload is not configured on this environment.", 503);
      }
      console.warn(
        "BLOB_READ_WRITE_TOKEN not found. Falling back to local public/uploads directory (dev only).",
      );
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
      await fs.mkdir(uploadsDir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(uploadsDir, filename), buffer);
      return NextResponse.json({ url: `/uploads/resumes/${filename}` });
    }

    const blob = await put(`resumes/${filename}`, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Resume upload failed:", error);
    return jsonError("Failed to upload file.", 500);
  }
}
