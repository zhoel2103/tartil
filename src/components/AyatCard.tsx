"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Ayat } from "@/services/api";
import { useAudio } from "@/context/AudioContext";
import { useBookmark } from "@/context/BookmarkContext";
import { compareRecitation } from "@/utils/arabicMatcher";
import { playSuccessSound, playErrorSound } from "@/utils/audioFeedback";

export interface AyatCardProps {
  ayat: Ayat;
  suratNomor?: number;
  suratNama?: string;
  suratNamaLatin?: string;
  tafsirHtml?: string;
  isHafalanMode?: boolean;
  isUnlocked?: boolean;
  onUnlock?: (ayatNomor: number) => void;
}

export default function AyatCard({
  ayat,
  suratNomor = 1,
  suratNama = "",
  suratNamaLatin = "",
  tafsirHtml,
  isHafalanMode = false,
  isUnlocked = false,
  onUnlock,
}: AyatCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);

  const [progress, setProgress] = useState(0);
  const { activeAyatNomor, setActiveAyatNomor, isPlayingGlobal, playNextAyat } = useAudio();
  const { isBookmarked, toggleBookmark, setAsLastRead } = useBookmark();

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState<
    "idle" | "listening" | "evaluating" | "success" | "failed"
  >("idle");
  const [transcript, setTranscript] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRevealedManually, setIsRevealedManually] = useState(false);
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);
  const [bookmarkToastMessage, setBookmarkToastMessage] = useState("");

  const isActive = activeAyatNomor === ayat.nomorAyat;
  const isHidden = isHafalanMode && !isUnlocked && !isRevealedManually;
  const bookmarked = isBookmarked(suratNomor, ayat.nomorAyat);

  useEffect(() => {
    if (isActive && isPlayingGlobal) {
      setTimeout(() => {
        audioRef.current?.play().catch(console.error);

        document.getElementById(`ayat-${ayat.nomorAyat}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    } else {
      audioRef.current?.pause();
    }
  }, [isActive, isPlayingGlobal, ayat.nomorAyat]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      if (duration) {
        setProgress(currentTime / duration);
      }
    }
  };

  const handleEnded = () => {
    setProgress(0);
    if (isActive && isPlayingGlobal) {
      playNextAyat();
    }
  };

  const handlePlay = () => {
    setActiveAyatNomor(ayat.nomorAyat);
    // Automatically record reading history
    setAsLastRead({
      suratNomor,
      suratNama,
      suratNamaLatin,
      ayatNomor: ayat.nomorAyat,
      teksArab: ayat.teksArab,
      teksIndonesia: ayat.teksIndonesia,
    });
  };

  const handleBookmarkToggle = () => {
    const isNowBookmarked = toggleBookmark({
      suratNomor,
      suratNama,
      suratNamaLatin,
      ayatNomor: ayat.nomorAyat,
      teksArab: ayat.teksArab,
      teksIndonesia: ayat.teksIndonesia,
    });

    // Also mark as last read when bookmarking
    if (isNowBookmarked) {
      setAsLastRead({
        suratNomor,
        suratNama,
        suratNamaLatin,
        ayatNomor: ayat.nomorAyat,
        teksArab: ayat.teksArab,
        teksIndonesia: ayat.teksIndonesia,
      });
      setBookmarkToastMessage("Ayat berhasil disimpan ke bookmark ✨");
    } else {
      setBookmarkToastMessage("Ayat dihapus dari bookmark");
    }

    setShowBookmarkToast(true);
    setTimeout(() => {
      setShowBookmarkToast(false);
    }, 2200);
  };

  // Start Voice Recognition (Lafazkan)
  const handleStartLafaz = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage(
        "Browser Anda belum mendukung Web Speech Recognition. Disarankan menggunakan Google Chrome, Edge, atau Safari."
      );
      setRecognitionStatus("failed");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = "ar-SA"; // Arabic (Saudi Arabia)
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      setRecognitionStatus("listening");
      setIsListening(true);
      setErrorMessage(null);
      setTranscript("");
      setFeedbackMessage("");

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const results = event.results[0];
        let bestResult: any = null;
        let highestScore = -1;

        for (let i = 0; i < results.length; i++) {
          const spoken = results[i].transcript;
          const evaluated = compareRecitation(spoken, ayat.teksArab, ayat.teksLatin);
          if (evaluated.score > highestScore) {
            highestScore = evaluated.score;
            bestResult = { ...evaluated, rawSpoken: spoken };
          }
        }

        const finalResult =
          bestResult ||
          compareRecitation(results[0].transcript, ayat.teksArab, ayat.teksLatin);

        const capturedSpoken = finalResult.rawSpoken || results[0].transcript;
        setTranscript(capturedSpoken);

        if (finalResult.isMatch) {
          setRecognitionStatus("success");
          setFeedbackMessage(finalResult.feedback);
          playSuccessSound();
          if (onUnlock) {
            onUnlock(ayat.nomorAyat);
          }
        } else {
          setRecognitionStatus("failed");
          setFeedbackMessage(finalResult.feedback);
          playErrorSound();
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "no-speech") {
          setErrorMessage("Suara tidak terdeteksi. Silakan coba dekatkan mikrofon dan lafazkan lagi.");
          setRecognitionStatus("failed");
        } else if (event.error === "not-allowed") {
          setErrorMessage("Izin mikrofon ditolak. Izinkan akses mikrofon di pengaturan browser Anda.");
          setRecognitionStatus("failed");
        } else {
          setErrorMessage(`Deteksi suara selesai (${event.error}). Silakan coba lagi.`);
          setRecognitionStatus("failed");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      setRecognitionStatus("failed");
      setErrorMessage("Gagal mengaktifkan mikrofon. Pastikan mikrofon Anda berfungsi.");
    }
  }, [ayat.nomorAyat, ayat.teksArab, ayat.teksLatin, onUnlock]);

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const words = ayat.teksArab.split(" ");
  const activeWordIndex = Math.min(Math.floor(progress * words.length), words.length - 1);
  const isPlaying = progress > 0 && progress < 1;

  return (
    <div
      id={`ayat-${ayat.nomorAyat}`}
      className={`scroll-mt-24 bg-emerald-50/50 dark:bg-emerald-900/60 rounded-3xl p-6 md:p-8 shadow-sm border transition-all duration-300 relative overflow-hidden group ${
        isActive
          ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
          : isUnlocked
          ? "border-emerald-500/60 ring-2 ring-emerald-500/15"
          : "border-emerald-100 dark:border-emerald-800/50 hover:border-amber-500/30"
      }`}
    >
      {/* Toast Bookmark Notification */}
      {showBookmarkToast && (
        <div className="absolute top-4 right-4 z-20 px-3.5 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-medium shadow-lg backdrop-blur-sm border border-white/10 animate-fade-in flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>{bookmarkToastMessage}</span>
        </div>
      )}

      {/* Top Header: Nomor Ayat, Status Badges, & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          {/* Badge Nomor Ayat */}
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-100/70 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-bold text-base border border-emerald-200 dark:border-emerald-700 shadow-inner">
            {ayat.nomorAyat}
          </div>

          {/* Badge Status Hafalan */}
          {isHafalanMode && (
            <div>
              {isUnlocked || recognitionStatus === "success" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 animate-fade-in">
                  <svg
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Terhafal ✨
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  <svg
                    className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Terkunci (Hafalan)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions: Bookmark & Lafazkan */}
        <div className="flex items-center gap-2">
          {/* Tombol Bookmark */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-2.5 rounded-xl text-xs font-medium transition-all duration-200 border flex items-center gap-1.5 ${
              bookmarked
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-400/40 shadow-sm"
                : "text-emerald-700/70 dark:text-emerald-300/70 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 border-emerald-200 dark:border-emerald-700"
            }`}
            title={bookmarked ? "Hapus dari Bookmark" : "Simpan Ayat ke Bookmark"}
            aria-label="Bookmark Ayat"
          >
            <svg
              className={`w-4 h-4 ${bookmarked ? "fill-amber-500 text-amber-500" : ""}`}
              fill={bookmarked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span className="hidden sm:inline text-xs font-medium">
              {bookmarked ? "Tersimpan" : "Bookmark"}
            </span>
          </button>

          {/* Action Button: Lafazkan (Voice Recognition) */}
          {isListening ? (
            <button
              onClick={handleStopListening}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium transition-all shadow-md shadow-red-500/20 animate-pulse"
              title="Hentikan mendengarkan"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span>Mendengarkan...</span>
            </button>
          ) : (
            <button
              onClick={handleStartLafaz}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm ${
                isHafalanMode && !isUnlocked
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 ring-2 ring-amber-400/40 hover:scale-[1.02]"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02]"
              }`}
              title="Uji pelafalan ayat ini dengan suara"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>{isHafalanMode && !isUnlocked ? "Lafazkan Ayat" : "Uji Lafaz"}</span>
            </button>
          )}

          {/* Manual Peek / Hide Button in Hafalan Mode */}
          {isHafalanMode && !isUnlocked && (
            <button
              onClick={() => setIsRevealedManually(!isRevealedManually)}
              className="p-2.5 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors border border-emerald-200 dark:border-emerald-700"
              title={isRevealedManually ? "Sembunyikan teks Arab" : "Intip teks Arab"}
            >
              {isRevealedManually ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Interactive Voice Recognition Feedback Banner */}
      {isListening && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40 animate-ping"></span>
              <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Mendengarkan bacaan Anda...
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                Silakan lafazkan ayat ke-{ayat.nomorAyat} dengan jelas
              </p>
            </div>
          </div>
          <div className="flex gap-1 items-center h-4">
            <span className="w-1 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-4 bg-amber-500 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}

      {/* Result feedback when user finished reciting */}
      {recognitionStatus === "success" && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 text-white shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                {feedbackMessage || "Lafaz Benar! MasyaAllah ✨"}
              </p>
              {transcript && (
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5" dir="rtl">
                  Terdengar: &ldquo;{transcript}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {recognitionStatus === "failed" && !isListening && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-rose-900 dark:text-rose-200">
                {errorMessage || feedbackMessage || "Lafaz belum tepat. Mari coba lagi!"}
              </p>
              {transcript && (
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5" dir="rtl">
                  Terdengar: &ldquo;{transcript}&rdquo;
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleStartLafaz}
            className="self-end sm:self-auto px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Teks Arab / Masked Hafalan Box */}
      <div className="mb-8">
        {isHidden ? (
          <div className="relative py-12 px-6 rounded-2xl bg-gradient-to-br from-emerald-100/50 to-emerald-200/30 dark:from-emerald-950/40 dark:to-emerald-900/30 border-2 border-dashed border-emerald-300/60 dark:border-emerald-700/60 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-400/30 shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-semibold text-emerald-950 dark:text-emerald-100">
                  Teks Arab Disembunyikan (Mode Hafalan)
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-slate-300 mt-1">
                  Uji hafalan Anda dengan menekan tombol <strong className="text-amber-600 dark:text-amber-400">Lafazkan</strong> di atas. Teks Arab akan terbuka secara otomatis jika bacaan benar.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleStartLafaz}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow-md shadow-amber-600/25 transition-transform hover:scale-105 inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Lafazkan Sekarang</span>
                </button>
                <button
                  onClick={() => setIsRevealedManually(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-sm font-medium hover:bg-white dark:hover:bg-emerald-800 transition-colors border border-emerald-200 dark:border-emerald-700"
                >
                  Intip Teks Arab
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <p
              className="font-arabic text-3xl sm:text-4xl md:text-5xl leading-loose text-right text-emerald-950 dark:text-emerald-50 transition-all duration-300"
              dir="rtl"
            >
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`transition-colors duration-200 ${
                    isPlaying && index === activeWordIndex
                      ? "text-amber-600 dark:text-amber-400 font-semibold"
                      : ""
                  }`}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
            {isRevealedManually && !isUnlocked && isHafalanMode && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-right mt-2 italic">
                (Teks sedang diintip)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Terjemahan Bahasa Indonesia (Teks Latin Transliterasi Ditiadakan) */}
      <div className="pt-6 border-t border-emerald-100 dark:border-emerald-800/50">
        <p className="text-emerald-900/90 dark:text-slate-300 leading-relaxed text-sm md:text-base">
          {ayat.teksIndonesia}
        </p>
      </div>

      {/* Tafsir (Accordion) */}
      {tafsirHtml && (
        <details className="mt-4 group/details">
          <summary className="cursor-pointer font-medium text-emerald-700 dark:text-emerald-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-2 list-none transition-colors text-sm">
            <span className="group-open/details:hidden">Tampilkan Tafsir (Kemenag)</span>
            <span className="hidden group-open/details:block">Sembunyikan Tafsir</span>
            <svg
              className="w-4 h-4 transition-transform group-open/details:-rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-slate-800 text-xs sm:text-sm leading-relaxed text-emerald-800/90 dark:text-slate-400">
            <div dangerouslySetInnerHTML={{ __html: tafsirHtml }} />
          </div>
        </details>
      )}

      {/* Audio Ayat */}
      <div className="mt-6 pt-4 border-t border-emerald-100/60 dark:border-emerald-800/40">
        <audio
          ref={audioRef}
          controls
          onPlay={handlePlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPause={handleTimeUpdate}
          className="w-full h-10 outline-none opacity-70 group-hover:opacity-100 transition-opacity"
        >
          <source src={ayat.audio["05"]} type="audio/mpeg" />
        </audio>
      </div>
    </div>
  );
}
