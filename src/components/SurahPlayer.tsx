"use client";

import { useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import type { Ayat } from "@/services/api";

export default function SurahPlayer({ suratName, qari, ayats }: { suratName: string, qari: string, ayats: Ayat[] }) {
  const { isPlayingGlobal, setIsPlayingGlobal, activeAyatNomor, setActiveAyatNomor, setAyats } = useAudio();

  // Initialize ayats in context on mount
  useEffect(() => {
    setAyats(ayats);
  }, [ayats, setAyats]);

  const handleTogglePlay = () => {
    if (!isPlayingGlobal) {
      if (activeAyatNomor === null) {
        // Start from first ayat if nothing is active
        setActiveAyatNomor(ayats[0].nomorAyat);
      }
      setIsPlayingGlobal(true);
    } else {
      setIsPlayingGlobal(false);
    }
  };

  return (
    <div className="bg-emerald-50/50 dark:bg-emerald-900 rounded-2xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-800/50 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-emerald-950 dark:text-slate-100">Murottal Surat {suratName}</h3>
        <p className="text-sm text-emerald-700/80 dark:text-slate-400">{qari}</p>
        
        {activeAyatNomor && (
          <p className="text-xs font-medium text-emerald-600 mt-1">
            Memutar Ayat {activeAyatNomor} / {ayats.length}
          </p>
        )}
      </div>
      
      <button 
        onClick={handleTogglePlay}
        className={`w-full sm:w-auto px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors ${
          isPlayingGlobal 
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400' 
            : 'bg-emerald-700 text-white hover:bg-emerald-800'
        }`}
      >
        {isPlayingGlobal ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Jeda (Pause)
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Putar Semua Ayat
          </>
        )}
      </button>
    </div>
  );
}
