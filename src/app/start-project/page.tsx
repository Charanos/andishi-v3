import type { Metadata } from "next";
import { StartProjectExperience } from "@/components/sections/start-project-experience";

export const metadata: Metadata = {
  title: "Start Hiring - Andishi",
  description:
    "Share your stack, timeline, and engineering needs so Andishi can match you with vetted senior African engineers.",
};

export default function StartProjectPage() {
  return <StartProjectExperience />;
}
