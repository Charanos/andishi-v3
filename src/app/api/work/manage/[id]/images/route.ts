import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/responses";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * POST /api/work/manage/[id]/images
 *
 * Admin-only. Accepts a multipart/form-data upload with a single "file" field.
 * Writes to Vercel Blob and returns the CDN URL for immediate use in the UI.
 *
 * Optional ?field= query param (cover | og | gallery | step | highlight) is used
 * to build a semantic blob pathname so images are organized in the Blob store.
 *
 * The returned URL should be saved back to the project via
 * PATCH /api/work/manage/[id] with the appropriate field.
 */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  const field = req.nextUrl.searchParams.get("field") || "gallery";

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("Invalid multipart/form-data body", 400);
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return jsonError("No file field found in request", 400);
  }

  // Type assertion: FormData.get() returns File | string in browser, but
  // Next.js formData returns Blob/File objects for binary fields.
  const blob = file as File;

  if (!ALLOWED_TYPES.includes(blob.type)) {
    return jsonError(
      `Unsupported file type: ${blob.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF`,
      415,
    );
  }

  if (blob.size > MAX_BYTES) {
    return jsonError(`File too large: ${Math.round(blob.size / 1024)}KB. Maximum 8MB.`, 413);
  }

  const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const timestamp = Date.now();
  const pathname = `case-studies/${id}/${field}/${timestamp}.${extension}`;

  try {
    const result = await put(pathname, blob, {
      access: "public",
      contentType: blob.type,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: result.url,
      field,
      size: blob.size,
      type: blob.type,
    });
  } catch (err) {
    console.error("[POST /api/work/manage/:id/images] Blob upload failed:", err);
    return jsonError("Image upload failed. Please try again.", 500);
  }
}
