/**
 * Quran.Foundation API Client Service
 * Uses OAuth2 client_credentials to communicate with Quran.Foundation Content API v4
 */

export interface QuranFoundationWord {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: "word" | "end";
  text_uthmani: string;
  text_imlaei: string;
  page_number: number;
  line_number: number;
  text: string;
  translation?: {
    text: string;
    language_name?: string;
  };
  transliteration?: {
    text: string;
    language_name?: string;
  };
}

export interface QuranFoundationVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number?: number;
  rub_el_hizb_number?: number;
  ruku_number?: number;
  page_number?: number;
  juz_number?: number;
  words: QuranFoundationWord[];
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

const CLIENT_ID = "7a1689ca-faaf-4057-b729-f8560ca25ec8";
const CLIENT_SECRET = "qfcs_53749fa9852c4b62b791adea549c45ca659dbd43532641779ab8c9101a347e59";

const PRELIVE_AUTH_URL = "https://prelive-oauth2.quran.foundation/oauth2/token";
const PRELIVE_API_URL = "https://apis-prelive.quran.foundation/content/api/v4";
const AUDIO_CDN_BASE = "https://audio.qurancdn.com";

// In-memory caches
let cachedToken: string | null = null;
let tokenExpiresAt = 0;
const verseCache = new Map<string, QuranFoundationWord[]>();

/**
 * Retrieve a valid OAuth2 Bearer token
 * Caches token in memory and localStorage for the duration of expires_in
 */
export async function getQuranFoundationToken(): Promise<string | null> {
  const now = Date.now();

  // 1. Check in-memory cache (with 60-second safety buffer)
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  // 2. Check localStorage in browser environment
  if (typeof window !== "undefined") {
    try {
      const storedToken = localStorage.getItem("qf_access_token");
      const storedExpiry = parseInt(localStorage.getItem("qf_token_expires_at") || "0", 10);
      if (storedToken && storedExpiry > now + 60000) {
        cachedToken = storedToken;
        tokenExpiresAt = storedExpiry;
        return storedToken;
      }
    } catch {
      // ignore localStorage errors (e.g. incognito mode restrictions)
    }
  }

  // 3. Try fetching via Cloudflare Pages Function endpoint (/api/quran-token)
  try {
    const res = await fetch("/api/quran-token", {
      method: "POST",
    });

    if (res.ok) {
      const data: TokenResponse = await res.json();
      if (data.access_token) {
        saveToken(data.access_token, data.expires_in || 3600);
        return data.access_token;
      }
    }
  } catch {
    // /api/quran-token may not be available in local static dev or preview
  }

  // 4. Direct fetch to Quran.Foundation OAuth2 token endpoint
  try {
    const authHeader = "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const res = await fetch(PRELIVE_AUTH_URL, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "content",
      }).toString(),
    });

    if (res.ok) {
      const data: TokenResponse = await res.json();
      if (data.access_token) {
        saveToken(data.access_token, data.expires_in || 3600);
        return data.access_token;
      }
    }
  } catch (err) {
    console.warn("Quran.Foundation direct OAuth fetch failed:", err);
  }

  return cachedToken;
}

function saveToken(token: string, expiresIn: number) {
  cachedToken = token;
  tokenExpiresAt = Date.now() + expiresIn * 1000;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("qf_access_token", token);
      localStorage.setItem("qf_token_expires_at", tokenExpiresAt.toString());
    } catch {
      // ignore
    }
  }
}

/**
 * Fetch word-by-word data for a specific Surah and Ayah from Quran.Foundation Content API
 * @param surahNumber 1 to 114
 * @param ayahNumber Verse number
 */
export async function getVerseWords(
  surahNumber: number,
  ayahNumber: number
): Promise<QuranFoundationWord[] | null> {
  const verseKey = `${surahNumber}:${ayahNumber}`;

  // Check in-memory cache
  if (verseCache.has(verseKey)) {
    return verseCache.get(verseKey)!;
  }

  // Check sessionStorage cache
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(`qf_verse_${verseKey}`);
      if (cached) {
        const words: QuranFoundationWord[] = JSON.parse(cached);
        verseCache.set(verseKey, words);
        return words;
      }
    } catch {
      // ignore
    }
  }

  const token = await getQuranFoundationToken();
  if (!token) {
    console.warn("Quran.Foundation token is unavailable for verse lookup.");
    return null;
  }

  try {
    const url = `${PRELIVE_API_URL}/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,text_imlaei`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-auth-token": token,
        "x-client-id": CLIENT_ID,
      },
    });

    if (!res.ok) {
      console.warn(`Quran.Foundation API responded with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const words: QuranFoundationWord[] = data?.verse?.words || [];

    // Cache the result
    verseCache.set(verseKey, words);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`qf_verse_${verseKey}`, JSON.stringify(words));
      } catch {
        // ignore
      }
    }

    return words;
  } catch (err) {
    console.error("Failed to fetch verse words from Quran.Foundation:", err);
    return null;
  }
}

/**
 * Construct full CDN URL for a word's audio file
 */
export function getWordAudioUrl(audioUrl: string | null): string | null {
  if (!audioUrl) return null;
  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
    return audioUrl;
  }
  return `${AUDIO_CDN_BASE}/${audioUrl}`;
}

export interface VerseTiming {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  duration: number;
  segments: [number, number, number][]; // [word_position, start_ms, end_ms]
}

const chapterTimestampsCache = new Map<string, Record<string, VerseTiming>>();

/**
 * Fetch chapter recitation audio timestamps and word-level segments (e.g. for Mishary Alafasy reciter 7)
 * Provides millisecond-accurate timing for every word, respecting pauses, breath stops, and repetitions.
 */
export async function getChapterTimestamps(
  surahNumber: number,
  reciterId: number = 7
): Promise<Record<string, VerseTiming> | null> {
  const cacheKey = `${reciterId}:${surahNumber}`;

  // Check memory cache
  if (chapterTimestampsCache.has(cacheKey)) {
    return chapterTimestampsCache.get(cacheKey)!;
  }

  // Check sessionStorage cache
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(`qf_timestamps_${cacheKey}`);
      if (cached) {
        const parsed: Record<string, VerseTiming> = JSON.parse(cached);
        chapterTimestampsCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  // 1. Try Quran.Foundation API with access token
  const token = await getQuranFoundationToken();
  let rawTimestamps: VerseTiming[] | null = null;

  if (token) {
    try {
      const url = `${PRELIVE_API_URL}/chapter_recitations/${reciterId}/${surahNumber}?segments=true`;
      const res = await fetch(url, {
        headers: {
          "x-auth-token": token,
          "x-client-id": CLIENT_ID,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.audio_file?.timestamps) {
          rawTimestamps = data.audio_file.timestamps;
        }
      }
    } catch {
      // ignore and fallback
    }
  }

  // 2. Fallback to production endpoint (full coverage for all 114 Surahs)
  if (!rawTimestamps) {
    try {
      const fallbackUrl = `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${surahNumber}?segments=true`;
      const res = await fetch(fallbackUrl);
      if (res.ok) {
        const data = await res.json();
        if (data?.audio_file?.timestamps) {
          rawTimestamps = data.audio_file.timestamps;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch chapter recitation segments:", err);
    }
  }

  if (!rawTimestamps) {
    return null;
  }

  // Convert array of timestamps to dictionary keyed by verse_key (e.g. "18:2")
  const timingMap: Record<string, VerseTiming> = {};
  for (const item of rawTimestamps) {
    timingMap[item.verse_key] = item;
  }

  // Cache in memory and sessionStorage
  chapterTimestampsCache.set(cacheKey, timingMap);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`qf_timestamps_${cacheKey}`, JSON.stringify(timingMap));
    } catch {
      // ignore
    }
  }

  return timingMap;
}

/**
 * Get timing and word-level segments for a specific Ayat
 */
export async function getVerseTiming(
  surahNumber: number,
  ayahNumber: number,
  reciterId: number = 7
): Promise<VerseTiming | null> {
  const chapterTimings = await getChapterTimestamps(surahNumber, reciterId);
  if (!chapterTimings) return null;
  const verseKey = `${surahNumber}:${ayahNumber}`;
  return chapterTimings[verseKey] || null;
}

/**
 * Calculate the currently active word index based on playback time and Quran.Foundation segment data.
 * Correctly accounts for pauses, waqf, and repeated words in recitation.
 */
export function getActiveWordIndex(
  currentTimeSec: number,
  timing: VerseTiming | null,
  totalWordsCount: number,
  fallbackProgress: number = 0
): number {
  if (timing && timing.segments && timing.segments.length > 0) {
    const currentMs = currentTimeSec * 1000;
    const baseOffset = timing.timestamp_from;

    // Check if playback is directly inside a word segment [word_position, start_ms, end_ms]
    for (let i = 0; i < timing.segments.length; i++) {
      const [wordPos, startMs, endMs] = timing.segments[i];
      const relStart = startMs - baseOffset;
      const relEnd = endMs - baseOffset;

      if (currentMs >= relStart && currentMs <= relEnd) {
        return Math.min(wordPos - 1, totalWordsCount - 1);
      }
    }

    // If current time is in a pause or between words, keep the most recent recited word highlighted
    let lastWordIndex = -1;
    for (let i = 0; i < timing.segments.length; i++) {
      const [wordPos, startMs] = timing.segments[i];
      const relStart = startMs - baseOffset;
      if (currentMs >= relStart) {
        lastWordIndex = wordPos - 1;
      } else {
        break;
      }
    }

    if (lastWordIndex >= 0) {
      return Math.min(lastWordIndex, totalWordsCount - 1);
    }

    return 0;
  }

  // Fallback: estimate from progress percentage if timing metadata is absent
  return Math.min(Math.floor(fallbackProgress * totalWordsCount), totalWordsCount - 1);
}

/**
 * Get seek time in seconds to jump directly to a specific word in the ayah audio
 */
export function getWordSeekTime(
  wordIndex: number, // 0-indexed
  timing: VerseTiming | null
): number | null {
  if (!timing || !timing.segments || timing.segments.length === 0) return null;
  const targetPos = wordIndex + 1; // 1-indexed
  const segment = timing.segments.find(([pos]) => pos === targetPos);
  if (!segment) return null;
  const relStart = segment[1] - timing.timestamp_from;
  return Math.max(0, relStart / 1000);
}

