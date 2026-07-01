"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { revokeSession } from "@/lib/auth/session";

export async function signOutAction() {
  return Sentry.withServerActionInstrumentation(
    "signOutAction",
    {
      headers: await headers(),
      recordResponse: true,
    },
    async () => {
      await revokeSession();
      redirect("/login");
    },
  );
}
