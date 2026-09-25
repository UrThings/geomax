export const SITE_NAME = "Geomax";
export const SITE_TAGLINE = "Сонгож үзээд, шууд холбогдоорой.";
export const SEARCH_PLACEHOLDER = "Бараа хайх...";

export const PUBLIC_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

export const SORT_OPTIONS = [
  { value: "newest", label: "Шинээр нэмэгдсэн" },
  { value: "price_asc", label: "Үнэ бага → их" },
  { value: "price_desc", label: "Үнэ их → бага" },
  { value: "name_asc", label: "Нэр A → Z" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/admin/products", label: "Бараанууд", icon: "package" },
  { href: "/admin/products/new", label: "Бараа нэмэх", icon: "plus-circle" },
  { href: "/admin/categories", label: "Категори", icon: "folder" },
  { href: "/admin/settings", label: "Тохиргоо", icon: "settings" },
] as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const IMAGE_MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};