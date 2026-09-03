"use client";

import { useState, useRef, useEffect } from "react";
import type { Ayat } from "@/services/api";
import { useAudio } from "@/context/AudioContext";

export default function AyatCard({ ayat, tafsirHtml }: { ayat: Ayat; tafsirHtml?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const { activeAyatNomor, setActiveAyatNomor, isPlayingGlobal, playNextAyat } = useAudio();

  const isActive = activeAyatNomor === ayat.nomorAyat;

  useEffect(() => {
    if (isActive && isPlayingGlobal) {
      // Small timeout to allow DOM to settle before playing
      setTimeout(() => {
        audioRef.current?.play().catch(console.error);
        
        // Scroll into view if active
        document.getElementById(`ayat-${ayat.nomorAyat}`)?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    } else {
      audioRef.current?.pause();
    }
  }, [isActive, isPlayingGlobal, ayat.nomorAyat]);

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
  };

  // Splitting arabic text into words for highlighting
  const words = ayat.teksArab.split(" ");
  // Calculate which word should be highlighted based on audio progress
  const activeWordIndex = Math.min(Math.floor(progress * words.length), words.length - 1);
  const isPlaying = progress > 0 && progress < 1;

  return (
    <div id={`ayat-${ayat.nomorAyat}`} className={`scroll-mt-24 bg-emerald-50/50 dark:bg-emerald-900 rounded-2xl p-6 md:p-8 shadow-sm border ${isActive ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-emerald-100 dark:border-emerald-800/50'} group hover:border-amber-500/30 transition-all duration-300`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        {/* Nomor Ayat & Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-lg border border-emerald-100 dark:border-emerald-800">
            {ayat.nomorAyat}
          </div>
        </div>
        
        {/* Teks Arab dengan Highlight */}
        <div className="flex-1">
          <p className="font-arabic text-3xl sm:text-4xl md:text-5xl leading-loose text-right text-emerald-950 dark:text-emerald-50" dir="rtl">
            {words.map((word, index) => (
              <span
                key={index}
                className={`transition-colors duration-200 ${
                  isPlaying && index === activeWordIndex
                    ? "text-amber-600 dark:text-amber-400"
                    : ""
                }`}
              >
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Terjemahan */}
      <div className="pt-6 border-t border-emerald-100 dark:border-emerald-800/50 space-y-3">
        <p className="text-emerald-900/90 dark:text-slate-300 leading-relaxed text-sm md:text-base">
          {ayat.teksIndonesia}
        </p>
      </div>

      {/* Tafsir (Accordion) */}
      {tafsirHtml && (
        <details className="mt-4 group/details">
          <summary className="cursor-pointer font-medium text-emerald-700 dark:text-emerald-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-2 list-none transition-colors">
            <span className="group-open/details:hidden">Tampilkan Tafsir (Kemenag)</span>
            <span className="hidden group-open/details:block">Sembunyikan Tafsir</span>
            <svg className="w-4 h-4 transition-transform group-open/details:-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-slate-800 text-sm leading-relaxed text-emerald-800/80 dark:text-slate-400">
            <p dangerouslySetInnerHTML={{ __html: tafsirHtml }} />
          </div>
        </details>
      )}
      
      {/* Audio Ayat */}
      <div className="mt-6 pt-4">
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
