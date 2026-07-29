"use client";

/**
 * src/components/marketing/case-study-share-bar.tsx
 *
 * Sleek, refined action & share bar for case study pages.
 * Appends UTM parameters for share tracking, provides direct WhatsApp booking CTAs,
 * and copy link functionality.
 */

import { useState } from "react";
import { IconBrandWhatsapp, IconLink, IconCheck } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cosmicSpring } from "@/lib/motion";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type CaseStudyShareBarProps = {
  slug: string;
  title: string;
  sector?: string;
  sectorLabel?: string;
  isAdmin?: boolean;
  className?: string;
};

function buildShareUrl(slug: string, medium: string, content?: string) {
  const base =
    typeof window !== "undefined" ? `${window.location.origin}/work/${slug}` : `/work/${slug}`;

  const params = new URLSearchParams({
    utm_source: "case_study",
    utm_medium: medium,
    utm_campaign: slug,
    ...(content && { utm_content: content }),
  });
  return `${base}?${params.toString()}`;
}

export function CaseStudyShareBar({
  slug,
  title,
  sector = "custom-software",
  sectorLabel = "Custom Software",
  isAdmin = false,
  className = "",
}: CaseStudyShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCampaign, setCopiedCampaign] = useState(false);

  const copyLink = async () => {
    const url = buildShareUrl(slug, "share");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const copyCampaignLink = async () => {
    const url = buildShareUrl(slug, "paid_social", "ad_cta");
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCampaign(true);
      setTimeout(() => setCopiedCampaign(false), 2200);
    } catch {}
  };

  const whatsappBuildUrl = buildWhatsAppUrl(sector, {
    context: `case study: ${title} (${sectorLabel})`,
  });

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Copy link */}
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-1.5 font-mono text-[0.75rem] text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-200 hover:border-[var(--secondary)] hover:text-[var(--on-surface)] cursor-pointer"
        aria-label="Copy case study link"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: cosmicSpring }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5 text-[var(--tertiary)]"
            >
              <IconCheck size={13} />
              <span>Link copied</span>
            </motion.span>
          ) : (
            <motion.span
              key="link"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              <IconLink size={13} />
              <span>Copy link</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* WhatsApp CTA */}
      <a
        href={whatsappBuildUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_40%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3.5 py-1.5 font-mono text-[0.75rem] text-[var(--tertiary)] backdrop-blur-xl transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--tertiary)_20%,transparent)]"
        aria-label="Build a project like this on WhatsApp"
      >
        <IconBrandWhatsapp size={14} />
        <span>Build like this</span>
      </a>

      {/* Admin campaign link */}
      {isAdmin && (
        <button
          onClick={copyCampaignLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--secondary)_40%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-3 py-1 font-mono text-[0.72rem] text-[var(--secondary)] backdrop-blur-xl transition-all hover:bg-[color-mix(in_srgb,var(--secondary)_20%,transparent)]"
        >
          {copiedCampaign ? <IconCheck size={12} /> : <IconLink size={12} />}
          <span>{copiedCampaign ? "UTM Link Copied!" : "Ad UTM"}</span>
        </button>
      )}
    </div>
  );
}
