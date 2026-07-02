export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  avatarUrl: string;
  projectUrl?: string;
  rating: number; // 1-5
  date: string;
  status: "active" | "archived";
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    authorName: "Amina Otieno",
    authorRole: "CTO, Haraka Fleet",
    content:
      "Andishi delivered our custom fleet routing platform in under 6 weeks. The code is modular, type-safe, and performs flawlessly under high operational loads. We bypassed the standard recruiter overhead entirely.",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: "/work/haraka-fleet",
    rating: 5,
    date: "2026-05-12",
    status: "active",
  },
  {
    id: "test-2",
    authorName: "Kwame Mensah",
    authorRole: "Founder, Lipa Commerce",
    content:
      "The custom payment ledger Andishi built for us was exactly what we needed to move off manual spreadsheets. Direct communications with their product engineers saved us weeks of scoping cycles.",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: "/work/lipa-commerce",
    rating: 5,
    date: "2026-06-04",
    status: "active",
  },
  {
    id: "test-3",
    authorName: "Zainab Bello",
    authorRole: "Director of Product, MySchool Platform",
    content:
      "Their expertise in database scaling was obvious from day one. They re-architected our core student database and speeded up page loading times by over 200%. Highly recommended for complex backend systems.",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: "/work/myschool-platform",
    rating: 5,
    date: "2026-04-18",
    status: "active",
  },
  {
    id: "test-4",
    authorName: "Ethan Novak",
    authorRole: "Co-Founder, Orbit Labs",
    content:
      "We hired Andishi to build our AI document search pipeline. The integration is seamless and cost-controlled. Their engineering capability is on par with top-tier global agencies.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
    date: "2026-05-30",
    status: "active",
  },
];

const LOCAL_STORAGE_KEY = "andishi_testimonials_v3";

export function getTestimonials(): Testimonial[] {
  if (typeof window === "undefined") return DEFAULT_TESTIMONIALS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_TESTIMONIALS));
    return DEFAULT_TESTIMONIALS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_TESTIMONIALS;
  }
}

export function saveTestimonial(testimonial: Testimonial): Testimonial[] {
  const current = getTestimonials();
  const index = current.findIndex((t) => t.id === testimonial.id);

  if (index >= 0) {
    current[index] = testimonial;
  } else {
    current.push(testimonial);
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("testimonials_updated"));
  }
  return current;
}

export function deleteTestimonial(id: string): Testimonial[] {
  const current = getTestimonials();
  const filtered = current.filter((t) => t.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("testimonials_updated"));
  }
  return filtered;
}
