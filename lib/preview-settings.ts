import type { SiteSettings } from "./site-data";

/** Campos que o painel pode sobrescrever na prévia ao vivo. */
export const PREVIEW_KEYS = [
  "hero_eyebrow",
  "hero_text",
  "story_text",
  "story_years",
  "hours_weekday",
  "hours_saturday",
  "whatsapp_number",
  "whatsapp_message",
] as const satisfies readonly (keyof SiteSettings)[];

/** Mantém só as chaves permitidas cujo valor é texto. */
export function pickPreviewSettings(data: unknown): Partial<SiteSettings> {
  const picked: Partial<SiteSettings> = {};
  if (typeof data !== "object" || data === null) return picked;
  for (const key of PREVIEW_KEYS) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "string") picked[key] = value;
  }
  return picked;
}
