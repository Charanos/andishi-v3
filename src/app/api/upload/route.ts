import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/responses";
import fs from "fs/promises";
import path from "path";

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
  
  if (!file.type.startsWith("image/")) {
    return jsonError("Only images are allowed.", 400, "file");
  }

  try {
    const filename = `${session.user.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Production filesystems (Vercel) are read-only outside /tmp, so a
      // local-disk write would fail anyway - fail loudly here instead of
      // with an opaque ENOENT/EROFS from fs.writeFile.
      if (process.env.NODE_ENV === "production") {
        console.error("BLOB_READ_WRITE_TOKEN is not configured in production; file upload is unavailable.");
        return jsonError("File upload is not configured on this environment.", 503);
      }
      console.warn("BLOB_READ_WRITE_TOKEN not found. Falling back to local public/uploads directory (dev only).");
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(uploadsDir, filename), buffer);
      return NextResponse.json({ url: `/uploads/${filename}` });
    }

    // Normal Vercel Blob upload
    const blob = await put(`avatars/${filename}`, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload failed:", error);
    return jsonError("Failed to upload file.", 500);
  }
}


