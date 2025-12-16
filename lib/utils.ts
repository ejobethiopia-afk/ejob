// src/lib/utils.ts (or equivalent file for utility functions)

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes safely and efficiently.
 * Uses 'clsx' to conditionally join classes and 'tailwind-merge' to resolve conflicts.
 * * @param inputs A list of class strings, objects, or arrays.
 * @returns A single merged and optimized class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

/**
 * Validates if a string conforms to the standard UUID format (v1-v5).
 * * @param value The string to check.
 * @returns True if the string is a valid UUID, false otherwise.
 */
export function isUUID(value: string) {
  if (!value || typeof value !== 'string') return false;
  // Regex matches 8-4-4-4-12 hex digits with proper version/variant checks
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}