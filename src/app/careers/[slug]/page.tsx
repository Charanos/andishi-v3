import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerDetailExperience } from "@/components/marketing/career-detail-experience";
import { getJobBySlug } from "@/data/careers";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) return {};

  return {
    title: `${job.title} - Careers | Andishi`,
    description: `Apply for the ${job.title} role in the ${job.department} department. Location: ${job.location}. Compensation: ${job.compensation_note}`,
    openGraph: {
      title: `${job.title} - Careers | Andishi`,
      description: `Join Andishi as a ${job.title}. Department: ${job.department}. Remote: ${job.remote ? "Yes" : "No"}.`,
      type: "website",
    },
  };
}

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;
  // Note: on the client we read from localStorage, but we pass slug to let the client component know which job to load.
  return <CareerDetailExperience slug={slug} />;
}
