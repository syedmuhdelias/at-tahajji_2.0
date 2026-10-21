import type { SiteContent } from "@/lib/site/content";
export function Brand({
  branding,
  href = "/",
  compact = false,
}: {
  branding: SiteContent["branding"];
  href?: string;
  compact?: boolean;
}) {
  return (
    <a
      className={`at-brand ${compact ? "compact" : ""}`}
      href={href}
      aria-label={`${branding.siteName} home`}
    >
      {branding.logoUrl && (
        <img
          src={branding.logoUrl}
          width="60"
          height="60"
          alt="Kaedah aT-Tahajji logo"
        />
      )}
      <span>
        <strong>{branding.siteName}</strong>
        <small>{branding.tagline}</small>
      </span>
    </a>
  );
}
