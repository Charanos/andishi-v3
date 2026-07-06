import type { Metadata } from "next";
import { CareerDetailExperience } from "@/components/marketing/career-detail-experience";
import { fetchPublicOpening } from "@/lib/api/public-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchPublicOpening(slug);
  if (!job) return {};

  return {
    title: `${job.title} - Careers | Andishi`,
    description: `Apply for the ${job.title} role in the ${job.department} department. Location: ${job.location}.${job.compensationNote ? ` Compensation: ${job.compensationNote}` : ""}`,
    openGraph: {
      title: `${job.title} - Careers | Andishi`,
      description: `Join Andishi as a ${job.title}. Department: ${job.department}. Remote: ${job.remote ? "Yes" : "No"}.`,
      type: "website",
    },
  };
}

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await fetchPublicOpening(slug);
  return <CareerDetailExperience slug={slug} initialJob={job} />;
}
