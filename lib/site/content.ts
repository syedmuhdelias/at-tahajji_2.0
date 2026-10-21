import { z } from "zod";

const short = z.string().trim().max(160);
const body = z.string().trim().max(2500);
export function safeImageUrl(value: string): boolean {
  if (!value) return true;
  if (
    /^\/(?:brand\/|api\/media\/)[a-zA-Z0-9_.\/-]+$/.test(value) &&
    !value.includes("..")
  )
    return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
export function videoEmbed(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (
      ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(
        host,
      )
    ) {
      const id =
        host === "youtu.be"
          ? url.pathname.slice(1)
          : url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      return id && /^[\w-]{11}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : null;
    }
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const id = url.pathname.match(/\/(\d+)\/?$/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    /* Invalid URL is not embeddable. */
  }
  return null;
}
const image = z
  .string()
  .max(2048)
  .refine(safeImageUrl, "Use an HTTPS image URL or an uploaded image.");
export const contentSchema = z.object({
  branding: z.object({
    siteName: short.min(1),
    tagline: short,
    logoUrl: image,
  }),
  hero: z.object({
    eyebrow: short,
    headline: short.min(1),
    subtext: body,
    posterUrl: image,
    posterAlt: short,
  }),
  teachers: z
    .array(
      z.object({
        photoUrl: image,
        name: short.min(1),
        role: short,
        bio: body,
        tags: z.array(short).max(8),
      }),
    )
    .max(12),
  videos: z
    .array(
      z.object({
        title: short.min(1),
        url: z
          .string()
          .max(2048)
          .refine(
            (v) => !!videoEmbed(v),
            "Use a valid HTTPS YouTube or Vimeo video link.",
          ),
      }),
    )
    .max(12),
  gallery: z.array(z.object({ imageUrl: image, caption: short })).max(12),
  contact: z.object({
    whatsapp: z
      .string()
      .regex(/^\d{7,15}$/, "Use 7–15 digits including country code."),
    phone: short,
    phoneTel: z
      .string()
      .regex(/^\+?[0-9 ()-]{7,25}$/, "Enter a valid phone number."),
    email: z.string().email().max(254),
    addressLine1: short,
    addressLine2: short,
    whatsappMessage: body,
  }),
  testimonials: z
    .array(
      z.object({ quote: body.min(1), author: short.min(1), imageUrl: image }),
    )
    .max(12),
});
export type SiteContent = z.infer<typeof contentSchema>;
export type ContentDocument = {
  content: SiteContent;
  revision: number;
  updatedAt: string | null;
};
export function whatsappUrl(contact: SiteContent["contact"]) {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage)}`;
}
