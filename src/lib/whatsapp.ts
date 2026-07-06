import { siteConfig } from "@/config/site";

/**
 * Service-specific WhatsApp pre-filled intro messages.
 *
 * Tone: friendly, professional, no emojis.
 * Each message tells the Andishi team exactly what kind of product
 * the visitor is interested in so the PM has immediate context.
 */
const serviceMessages: Record<string, string> = {
  "custom-software":
    "Hi Andishi, I'm looking to build a custom web application. I'd like to discuss my project scope, timeline, and goals. Can we chat?",
  "saas-development":
    "Hi Andishi, I want to build a SaaS platform - multi-tenant architecture, subscriptions, billing. I'd like to discuss the architecture and delivery timeline.",
  "mobile-apps":
    "Hi Andishi, I'm interested in building a mobile application for iOS and Android. Let's discuss my requirements and the best approach.",
  "ai-systems":
    "Hi Andishi, I'm interested in building an AI-powered system - LLMs, agents, or automation workflows. Let's discuss my use case and requirements.",
  "enterprise-software":
    "Hi Andishi, I need enterprise-grade software built - internal workflows, databases, or a legacy system revamp. I'd like to discuss the scope.",
  blockchain:
    "Hi Andishi, I'm exploring a blockchain or Web3 project - smart contracts, dApps, or token systems. Let's discuss my requirements.",
  "apis-integrations":
    "Hi Andishi, I need custom APIs, backend data pipelines, or third-party integrations built. Let's discuss the technical scope.",
  "product-strategy":
    "Hi Andishi, I'm looking for product strategy and technical consulting before starting a build. I'd like to discuss my product vision.",
};

const genericMessage =
  "Hi Andishi, I'm interested in discussing a software project. I'd like to tell you about what I'm building and explore how we can work together.";

const hireMessage =
  "Hi Andishi, I'm looking to hire a senior engineer for my team. I'd like to discuss the role, required skills, and timeline.";

/**
 * Builds a WhatsApp `wa.me` URL with a pre-filled message.
 *
 * @param serviceSlug  - Optional service slug from `data/services.ts`.
 *                        When provided, the message is tailored to that service.
 * @param options.context - Optional trailing context appended to the message
 *                          (e.g. the page the user clicked from, for PM reference).
 * @param options.variant - `"hire"` uses the hiring-specific message instead
 *                          of the product-build messages.
 */
export function buildWhatsAppUrl(
  serviceSlug?: string,
  options?: { context?: string; variant?: "hire" | "build" },
): string {
  const phone = siteConfig.whatsapp.phone;

  let text: string;

  if (options?.variant === "hire") {
    text = hireMessage;
  } else if (serviceSlug && serviceMessages[serviceSlug]) {
    text = serviceMessages[serviceSlug];
  } else {
    text = genericMessage;
  }

  if (options?.context) {
    text += `\n\n(Sent from ${options.context})`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
