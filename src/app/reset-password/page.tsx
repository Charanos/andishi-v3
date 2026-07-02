import type { Metadata } from "next";
import { ResetPasswordExperience } from "@/components/sections/reset-password-experience";

export const metadata: Metadata = {
  title: "Reset password - Andishi",
  description: "Set a new password for your Andishi workspace account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = getStringParam(params?.token);

  return <ResetPasswordExperience token={token} />;
}

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
