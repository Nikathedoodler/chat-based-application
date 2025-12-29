import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sanitize nickname for safe filename usage
export function sanitizeNickname(nickname: string): string {
  return nickname.replace(/[^a-zA-Z0-9-_]/g, "_");
}
