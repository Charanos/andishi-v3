import type { Metadata } from "next";
import { LoginPageExperience } from "@/components/sections/login-page-experience";

export const metadata: Metadata = {
  title: "Login - Andishi",
  description:
    "Sign in to the Andishi hiring workspace to review engineer matches, interview notes, onboarding status, and placement updates.",
};

export default function LoginPage() {
  return <LoginPageExperience />;
}
