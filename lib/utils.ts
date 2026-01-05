import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getVerificationProgress = (
  verified?: number,
  extracted?: number
) => {
  const total = extracted ?? 0;
  const done = verified ?? 0;
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
};

export const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};
