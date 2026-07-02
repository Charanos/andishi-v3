"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Simple bold parser
function parseBold(text: string): string {
  return text.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-[var(--on-surface)]">$1</strong>',
  );
}

// Custom simple markdown parser to render descriptions beautifully
export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) {
    return <p className="text-[var(--on-surface-dim)] italic text-[0.82rem] opacity-50 py-4 text-center">Nothing to preview yet...</p>;
  }

  const lines = content.split("\n");
  return (
    <div className="space-y-4 text-[0.9rem] leading-[1.7] text-[var(--on-surface-dim)] text-left select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="title-serif text-[1.32rem] font-normal text-[var(--on-surface)] mt-6 mb-3 border-b border-[var(--glass-border)] pb-2 first:mt-0"
            >
              {trimmed.substring(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="font-sans font-normal text-[1.02rem] text-[var(--on-surface)] mt-5 mb-2"
            >
              {trimmed.substring(4)}
            </h3>
          );
        }

        // Bullet Lists
        if (trimmed.startsWith("- ")) {
          const listText = trimmed.substring(2);
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2">
              <li className="pl-1">
                <span dangerouslySetInnerHTML={{ __html: parseBold(listText) }} />
              </li>
            </ul>
          );
        }

        // Standard Paragraphs
        if (trimmed === "") return <div key={idx} className="h-2" />;

        return (
          <p key={idx} className="mb-2">
            <span dangerouslySetInnerHTML={{ __html: parseBold(trimmed) }} />
          </p>
        );
      })}
    </div>
  );
}

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write description here in markdown format...",
  rows = 8,
  label = "Content",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  return (
    <div className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-low)] overflow-hidden">
      {/* Editor Header / Tab bar */}
      <div className="flex items-center justify-between border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] px-4 py-2">
        <span className="font-mono text-[0.66rem] uppercase tracking-wider text-[var(--on-surface-dim)] font-medium">
          {label} (Markdown)
        </span>
        <div className="flex gap-1 bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={cn(
              "rounded-md px-2.5 py-1 text-[0.72rem] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer",
              activeTab === "write"
                ? "bg-[var(--surface)] text-[var(--on-surface)] shadow-sm"
                : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={cn(
              "rounded-md px-2.5 py-1 text-[0.72rem] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer",
              activeTab === "preview"
                ? "bg-[var(--surface)] text-[var(--on-surface)] shadow-sm"
                : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
            )}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-3">
        {activeTab === "write" ? (
          <textarea
            required
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-0 p-1 font-sans text-[0.85rem] text-[var(--on-surface)] outline-none resize-y placeholder-[var(--on-surface-dim)]/40 focus:ring-0 focus:outline-none"
          />
        ) : (
          <div
            className="w-full overflow-y-auto p-1 border-0"
            style={{ minHeight: `${rows * 20}px`, maxHeight: "400px" }}
          >
            <MarkdownRenderer content={value} />
          </div>
        )}
      </div>
    </div>
  );
}
