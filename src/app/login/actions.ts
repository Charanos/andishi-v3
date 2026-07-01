"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { authenticateUser, createSession, getSafeRedirectForRole } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";

export type LoginFormState = {
  error?: string;
};

export async function loginAction(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  return Sentry.withServerActionInstrumentation(
    "loginAction",
    {
      formData,
      headers: await headers(),
      recordResponse: true,
    },
    async () => {
      const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        next: formData.get("next"),
      });

      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Check your login details." };
      }

      const { email, password, next } = parsed.data;
      const result = await authenticateUser(email, password).catch((error) => {
        console.error("Login authentication failed:", error);
        return null;
      });

      if (!result) {
        return { error: "Sign-in is temporarily unavailable. Please try again." };
      }

      if (!result.ok) {
        if (result.reason === "account_disabled") {
          redirect("/login?error=account_disabled");
        }

        if (result.reason === "account_invited") {
          return { error: "Your invitation is not active yet. Contact Andishi support." };
        }

        if (result.reason === "email_unverified") {
          return { error: "Please verify your email before signing in." };
        }

        return { error: "Email or password is incorrect." };
      }

      const sessionCreated = await createSession(result.user.id, undefined, result.user.role)
        .then(() => true)
        .catch((error) => {
          console.error("Session creation failed:", error);
          return false;
        });

      if (!sessionCreated) {
        return { error: "We could not start your session. Please try again." };
      }

      redirect(getSafeRedirectForRole(next, result.user.role));
    },
  );
}
