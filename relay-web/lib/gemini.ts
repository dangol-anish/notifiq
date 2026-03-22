import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Flash model for all AI features.
 * `gemini-1.5-flash` is no longer available on the current API (404) — use a
 * current id from https://ai.google.dev/gemini-api/docs/models/gemini
 * Override with GEMINI_MODEL in .env if needed (e.g. gemini-flash-latest).
 */
export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

let client: GoogleGenerativeAI | null = null;

/**
 * Lazily constructs the Google AI client when `GEMINI_API_KEY` is set.
 * Returns null if the key is missing (call sites should return 503).
 */
export function getGoogleGenerativeAI(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new GoogleGenerativeAI(key);
  return client;
}

/** Default generative model instance, or null without API key. */
export function getGeminiFlashModel() {
  const ai = getGoogleGenerativeAI();
  if (!ai) return null;
  return ai.getGenerativeModel({ model: GEMINI_MODEL });
}
