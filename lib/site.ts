import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SiteSettingsData = {
  id: number;
  ownerName: string;
  siteTitle: string | null;
  siteTagline: string | null;
  phone: string | null;
  facebookUrl: string | null;
  messengerUrl: string | null;
  instagramUrl: string | null;
  email: string | null;
  location: string | null;
  bio: string | null;
};

const DEFAULT_SETTINGS: Partial<SiteSettingsData> = {
  ownerName: "Geomax",
  siteTagline: "Сонгож үзээд, шууд холбогдоорой.",
};

export const getSettings = cache(async (): Promise<SiteSettingsData> => {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 1, ownerName: DEFAULT_SETTINGS.ownerName },
      });
    }
    return settings;
  } catch {
    return {
      id: 1,
      ownerName: DEFAULT_SETTINGS.ownerName as string,
      siteTitle: null,
      siteTagline: DEFAULT_SETTINGS.siteTagline as string,
      phone: null,
      facebookUrl: null,
      messengerUrl: null,
      instagramUrl: null,
      email: null,
      location: null,
      bio: null,
    };
  }
});