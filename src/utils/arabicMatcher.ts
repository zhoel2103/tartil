/**
 * Utility functions for normalizing and matching Arabic Quran recitation speech.
 */

// Strip Arabic tashkeel/diacritics, Quranic marks, and symbols
export function normalizeArabic(text: string): string {
  if (!text) return "";

  return text
    // Remove Quranic ayah markers (e.g. ۝ \u06DD) and numbers
    .replace(/[\u06DD\u06DE\u06DF\u06E0-\u06ED]/g, "")
    // Remove Arabic diacritics / Harakat
    // Fathah, Dammah, Kasrah, Sukun, Shaddah, Tanwins, Superscript Alif, Maddah
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Remove Arabic Tatweel (kashida)
    .replace(/\u0640/g, "")
    // Normalize Alif variants (أ, إ, آ, ٱ) to bare Alif (ا)
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    // Normalize Alif Maqsura (ى) to Ya (ي)
    .replace(/\u0649/g, "\u064A")
    // Normalize Ta Marbuta (ة) to Ha (ه)
    .replace(/\u0629/g, "\u0647")
    // Remove Hamza standalone variations if any
    .replace(/[\u0621\u0624\u0626]/g, "")
    // Remove punctuation, numbers (both Western and Arabic-Indic), brackets
    .replace(/[0-9\u0660-\u0669]/g, "")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟،؛«»"']/g, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein distance between two strings
function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= bn; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

// Calculate string similarity between 0 and 1
function stringSimilarity(s1: string, s2: string): number {
  if (!s1 && !s2) return 1;
  if (!s1 || !s2) return 0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, (maxLen - dist) / maxLen);
}

// Normalize latin transliteration for fallback checking
export function normalizeLatin(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface MatchResult {
  isMatch: boolean;
  score: number; // 0 to 100
  normalizedSpoken: string;
  normalizedTarget: string;
  feedback: string;
}

/**
 * Compare user's spoken recitation with the target ayat
 */
export function compareRecitation(
  spokenText: string,
  targetArabic: string,
  targetLatin?: string
): MatchResult {
  const normSpoken = normalizeArabic(spokenText);
  const normTarget = normalizeArabic(targetArabic);

  // If directly matches or includes
  if (normSpoken === normTarget) {
    return {
      isMatch: true,
      score: 100,
      normalizedSpoken: normSpoken,
      normalizedTarget: normTarget,
      feedback: "Lafaz Sangat Tepat! MasyaAllah ✨",
    };
  }

  // 1. Check full string similarity
  const fullSim = stringSimilarity(normSpoken, normTarget);

  // 2. Check word-level overlap
  const targetWords = normTarget.split(" ").filter(Boolean);
  const spokenWords = normSpoken.split(" ").filter(Boolean);

  let matchedWords = 0;
  for (const tWord of targetWords) {
    // Check if word or a close match exists in spoken words
    const found = spokenWords.some((sWord) => {
      if (sWord === tWord) return true;
      return stringSimilarity(sWord, tWord) >= 0.75;
    });
    if (found) matchedWords++;
  }

  const wordOverlapRatio = targetWords.length > 0 ? matchedWords / targetWords.length : 0;

  // Composite score (weighted word coverage + full string similarity)
  const compositeScore = Math.max(
    fullSim,
    wordOverlapRatio * 0.7 + fullSim * 0.3
  );

  const scorePercentage = Math.round(compositeScore * 100);

  // Also check if spoken in Latin (in case speech recognition recognized Indonesian/English)
  let latinScore = 0;
  if (targetLatin) {
    const normSpokenLatin = normalizeLatin(spokenText);
    const normTargetLatin = normalizeLatin(targetLatin);
    if (normSpokenLatin && normTargetLatin) {
      latinScore = stringSimilarity(normSpokenLatin, normTargetLatin);
    }
  }

  const finalScore = Math.max(scorePercentage, Math.round(latinScore * 100));

  // A score >= 60% is accepted as a pass for speech recognition
  // (accounting for speech-to-text variations and accents)
  const isMatch = finalScore >= 60 || normTarget.includes(normSpoken) && normSpoken.length >= normTarget.length * 0.6;

  let feedback = "Belum tepat. Coba lafazkan lagi dengan tartil.";
  if (finalScore >= 85) {
    feedback = "Lafaz Sangat Sempurna! MasyaAllah ✨";
  } else if (finalScore >= 60) {
    feedback = "Lafaz Benar! Terus tingkatkan hafalanmu 👍";
  } else if (finalScore >= 40) {
    feedback = "Hampir tepat. Ulangi pelafalan secara perlahan.";
  }

  return {
    isMatch,
    score: finalScore,
    normalizedSpoken: normSpoken || spokenText,
    normalizedTarget: normTarget,
    feedback,
  };
}
