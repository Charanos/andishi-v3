import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/login/actions";
import { LoginPageExperience } from "@/components/sections/login-page-experience";
import { clearSession, getSession, getSafeRedirectForRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Login - Andishi",
  description:
    "Sign in to the Andishi hiring workspace to review engineer matches, interview notes, onboarding status, and placement updates.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = getStringParam(params?.next);
  const error = getStringParam(params?.error);
  const session = await getSession();

  if (session?.user.status === "disabled") {
    await clearSession();
    redirect("/login?error=account_disabled");
  }

  if (session?.user.status === "active") {
    redirect(getSafeRedirectForRole(next, session.user.role));
  }

  return (
    <LoginPageExperience
      action={loginAction}
      initialError={error === "account_disabled" ? "This account is disabled. Contact Andishi support." : undefined}
      nextPath={next}
    />
  );
}

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
