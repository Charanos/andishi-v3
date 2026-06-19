"use server";

import { redirect } from "next/navigation";
import { revokeSession } from "@/lib/auth/session";

export async function signOutAction() {
  await revokeSession();
  redirect("/login");
}
