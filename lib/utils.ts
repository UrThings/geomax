import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatPrice(value: number) {
  return `${formatNumber(value)}₮`;
}

export function formatCompactPrice(value: number) {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)} сая₮`;
  }
  if (value >= 10_000) {
    const k = value / 1_000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)} мян₮`;
  }
  return formatPrice(value);
}

const LONG_MONTHS = [
  "Нэгдүгээр сар",
  "Хоёрдугаар сар",
  "Гуравдугаар сар",
  "Дөрөвдүгээр сар",
  "Тавдугаар сар",
  "Зургаадугаар сар",
  "Долдугаар сар",
  "Наймдугаар сар",
  "Есдүгээр сар",
  "Аравдугаар сар",
  "Арван нэгдүгээр сар",
  "Арван хоёрдугаар сар",
];

function monthGenitive(monthIndex: number) {
  return LONG_MONTHS[monthIndex].replace(/сар$/, "сарын");
}

export function formatDate(date: Date | string) {
  const value = new Date(date);
  return `${value.getFullYear()} оны ${monthGenitive(value.getMonth())} ${value.getDate()}`;
}

export function formatDateTime(date: Date | string) {
  const value = new Date(date);
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${value.getFullYear()} оны ${monthGenitive(value.getMonth())} ${value.getDate()}, ${hours}:${minutes}`;
}

export function absoluteUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "j",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  ө: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ү: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sh",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Алдаа гарлаа";
}

export function isBlobUrl(url: string) {
  return url.includes(".public.blob.vercel-storage.com");
}

export function sanitizeHttpUrl(value: string) {
  if (!value) return null;
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}