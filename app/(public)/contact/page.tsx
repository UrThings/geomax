import type { Metadata } from "next";
import { MapPin, Mail } from "lucide-react";
import { ContactButtons } from "@/components/products/contact-buttons";
import { getSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Холбоо барих",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight">Холбоо барих</h1>
      <p className="mt-4 text-muted-foreground">
        Асуулт, санал хүсэлт байвал доорх сувгуудаар холбогдоорой. Бид
        богино хугацаанд хариулах болно.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <a
          href={`tel:${(settings.phone ?? "").replace(/[^\d+]/g, "")}`}
          className="group flex items-center gap-4 rounded-xl border p-5 hover:border-primary"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            🏠
          </span>
          <div>
            <p className="font-semibold">Утас</p>
            <p className="text-sm text-muted-foreground">
              {settings.phone || "Тохируулаагүй"}
            </p>
          </div>
        </a>

        {settings.location ? (
          <div className="flex items-center gap-4 rounded-xl border p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold">Байршил</p>
              <p className="text-sm text-muted-foreground">
                {settings.location}
              </p>
            </div>
          </div>
        ) : null}

        {settings.email ? (
          <div className="flex items-center gap-4 rounded-xl border p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold">Имэйл</p>
              <p className="text-sm text-muted-foreground">
                {settings.email}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Шуурхай холбогдол</h2>
        <ContactButtons
          phone={settings.phone}
          facebookUrl={settings.facebookUrl}
          messengerUrl={settings.messengerUrl}
        />
      </div>
    </div>
  );
}