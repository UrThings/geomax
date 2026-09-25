import { AtSign, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ContactSource = {
  phone?: string | null;
  facebookUrl?: string | null;
  messengerUrl?: string | null;
};

type ContactButtonsProps = ContactSource & {
  className?: string;
  sold?: boolean;
  compact?: boolean;
};

export function ContactButtons({
  phone,
  facebookUrl,
  messengerUrl,
  className,
  sold = false,
  compact = false,
}: ContactButtonsProps) {
  const telHref = phone
    ? `tel:${phone.replace(/[^\d+]/g, "")}`
    : undefined;

  return (
    <div
      className={cn(
        "grid gap-2.5",
        compact
          ? "grid-cols-3"
          : "grid-cols-1 sm:grid-cols-3",
        className
      )}
    >
      {telHref ? (
        <Button asChild variant={compact ? "outline" : "default"} className={cn(!compact && "h-12 text-base")}>
          <a href={telHref} aria-label={`Утасдах: ${phone}`}>
            <Phone className="h-4 w-4" />
            {compact ? "Утасдах" : "Утасдах"}
          </a>
        </Button>
      ) : null}

      {facebookUrl ? (
        <Button asChild variant={compact ? "outline" : "default"} className={cn(!compact && "h-12 text-base")}>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook-ээр холбогдох"
          >
            <AtSign className="h-4 w-4" />
            Facebook
          </a>
        </Button>
      ) : null}

      {messengerUrl ? (
        <Button asChild variant={compact ? "outline" : "default"} className={cn(!compact && "h-12 text-base")}>
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Messenger-ээр холбогдох"
          >
            <MessageCircle className="h-4 w-4" />
            Messenger
          </a>
        </Button>
      ) : null}

      {!sold && !telHref && !facebookUrl && !messengerUrl ? (
        <p className="text-sm text-muted-foreground">
          Холбоо барих мэдээлэл тохируулаагүй байна.
        </p>
      ) : null}
    </div>
  );
}