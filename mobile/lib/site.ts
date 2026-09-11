export const SITE_NAME = "Diyar Properties";
export const SITE_TAGLINE = "Verified properties for sale and rent in Egypt";

// Base URL of the deployed web app — used so the mobile app can call the same
// Gemini-backed /api/chat route instead of duplicating the AI integration.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
