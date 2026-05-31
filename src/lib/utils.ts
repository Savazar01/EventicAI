import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COUNTRY_LOCALE: Record<string, string> = {
  US: "en-US",
  India: "en-IN",
  UK: "en-GB",
  Australia: "en-AU",
  UAE: "en-US",
  Singapore: "en-SG",
};

export function getDateLocale(country?: string): string {
  return COUNTRY_LOCALE[country || ""] || "en-US";
}

function ordinal(n: number): string {
  if (n % 10 === 1 && n !== 11) return "st";
  if (n % 10 === 2 && n !== 12) return "nd";
  if (n % 10 === 3 && n !== 13) return "rd";
  return "th";
}

export function formatDate(dateStr: string | null | undefined, country?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr.split("T")[0]);
  if (isNaN(d.getTime())) return dateStr;
  const locale = getDateLocale(country);
  const day = d.getDate();
  const weekday = d.toLocaleDateString(locale, { weekday: "long" });
  const month = d.toLocaleDateString(locale, { month: "long" });
  const year = d.getFullYear();
  const ord = ordinal(day);
  if (locale !== "en-US") {
    return `${weekday}, ${day}${ord} ${month} ${year}`;
  }
  return `${weekday}, ${month} ${day}${ord} ${year}`;
}
