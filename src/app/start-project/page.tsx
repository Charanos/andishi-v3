import type { Metadata } from "next";
import { StartProjectExperience } from "@/components/sections/start-project-experience";

export const metadata: Metadata = {
  title: "Start a Project - Andishi",
  description:
    "Start an Andishi project brief. Share your goals, timeline, and budget so the team can scope the right software delivery path.",
};

export default function StartProjectPage() {
  return <StartProjectExperience />;
}
