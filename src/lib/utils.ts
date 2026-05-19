import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const ROLE_CONFIG = {
  BEGINNER: { label: "Beginner", min: 0, color: "text-gray-500", bg: "bg-gray-100" },
  CONTRIBUTOR: { label: "Contributor", min: 50, color: "text-blue-600", bg: "bg-blue-50" },
  ADVANCED: { label: "Advanced", min: 200, color: "text-purple-600", bg: "bg-purple-50" },
  MENTOR: { label: "Mentor", min: 400, color: "text-amber-600", bg: "bg-amber-50" },
} as const;

export const POINTS_CONFIG = {
  POST_CONTENT: 10,
  GET_UPVOTE: 2,
  COMMENT: 1,
} as const;

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Medium: "text-amber-600 bg-amber-50 border-amber-200",
  Hard: "text-red-600 bg-red-50 border-red-200",
};

export const POST_TYPE_CONFIG = {
  EXPERIENCE: { label: "Experience", color: "bg-blue-50 text-blue-700 border-blue-200", emoji: "🏢" },
  QUESTION: { label: "Question", color: "bg-violet-50 text-violet-700 border-violet-200", emoji: "❓" },
  ROADMAP: { label: "Roadmap", color: "bg-emerald-50 text-emerald-700 border-emerald-200", emoji: "🗺️" },
} as const;
