import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Łączy klasy CSS w sposób warunkowy
 * @param {...string} inputs - Klasy CSS do połączenia
 * @returns {string} - Połączone klasy CSS
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}