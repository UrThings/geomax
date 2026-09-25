import Link from "next/link";
import { AtSign, Camera, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { SiteSettingsData } from "@/lib/site";

const YEAR = new Date().getFullYear();

export default function Footer({
  settings,
}: {
  settings: Pick<
    SiteSettingsData,
    | "ownerName"
    | "phone"
    | "facebookUrl"
    | "messengerUrl"
    | "instagramUrl"
    | "email"
    | "location"
  >;
}) {
  const hasContacts =
    settings.phone ||
    settings.facebookUrl ||
    settings.messengerUrl ||
    settings.instagramUrl ||
    settings.email;

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold">{settings.ownerName}</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Асуулт тодруулах зүйл байгаа бол шууд холбогдоорой.
            </p>
            {settings.location ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {settings.location}
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold">Цэс</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground">
                  Бүх бараа
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Холбоо барих
                </Link>
              </li>
            </ul>
          </div>

          {hasContacts ? (
            <div>
              <p className="text-sm font-semibold">Холбоо барих</p>
              <ul className="mt-2 space-y-2 text-sm">
                {settings.phone ? (
                  <li>
                    <a
                      href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="h-4 w-4" />
                      {settings.phone}
                    </a>
                  </li>
                ) : null}
                {settings.email ? (
                  <li>
                    <a
                      href={`mailto:${settings.email}`}
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Mail className="h-4 w-4" />
                      {settings.email}
                    </a>
                  </li>
                ) : null}
                {settings.facebookUrl ? (
                  <li>
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <AtSign className="h-4 w-4" />
                      Facebook
                    </a>
                  </li>
                ) : null}
                {settings.messengerUrl ? (
                  <li>
                    <a
                      href={settings.messengerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Messenger
                    </a>
                  </li>
                ) : null}
                {settings.instagramUrl ? (
                  <li>
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Camera className="h-4 w-4" />
                      Instagram
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © {YEAR} {settings.ownerName}. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}