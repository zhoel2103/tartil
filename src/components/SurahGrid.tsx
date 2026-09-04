"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Surat } from "@/services/api";

interface SurahGridProps {
  surats: Surat[];
}

// Surah Harian: Al-Kahf (18), As-Sajdah (32), Yasin (36), Ar-Rahman (55), Al-Waqi'ah (56), Al-Mulk (67), Al-A'la (87), Asy-Syams (91)
const SURAH_HARIAN_NUMBERS = [18, 32, 36, 55, 56, 67, 87, 91];

type FilterTab = "all" | "harian" | "juz_amma";

export default function SurahGrid({ surats }: SurahGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filteredSurats = useMemo(() => {
    if (activeTab === "harian") {
      return surats.filter((s) => SURAH_HARIAN_NUMBERS.includes(s.nomor));
    }
    if (activeTab === "juz_amma") {
      return surats.filter((s) => s.nomor >= 93 && s.nomor <= 114);
    }
    return surats;
  }, [activeTab, surats]);

  return (
    <div className="space-y-6">
      {/* Filter Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 dark:border-emerald-800/50 pb-4">
        {/* Tabs: Semua Surah, Surah Harian, Juz Amma */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-emerald-100/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
          {/* Tab Semua Surah */}
          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "all"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.02]"
                : "text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/40"
            }`}
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
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            <span>Semua Surah</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                activeTab === "all"
                  ? "bg-emerald-800/60 text-emerald-100"
                  : "bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
              }`}
            >
              114
            </span>
          </button>

          {/* Tab Surah Harian */}
          <button
            onClick={() => setActiveTab("harian")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "harian"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-[1.02]"
                : "text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/40"
            }`}
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span>Surah Harian</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                activeTab === "harian"
                  ? "bg-amber-700/60 text-amber-100"
                  : "bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
              }`}
            >
              8
            </span>
          </button>

          {/* Tab Juz Amma */}
          <button
            onClick={() => setActiveTab("juz_amma")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "juz_amma"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.02]"
                : "text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/40"
            }`}
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span>Juz 'Amma</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                activeTab === "juz_amma"
                  ? "bg-emerald-800/60 text-emerald-100"
                  : "bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
              }`}
            >
              93 - 114
            </span>
          </button>
        </div>

        {/* Tab Description Context */}
        <div className="text-xs sm:text-sm text-emerald-700/80 dark:text-emerald-400/80">
          {activeTab === "harian" && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Al-Kahf, As-Sajdah, Yasin, Ar-Rahman, Al-Waqi'ah, Al-Mulk, Al-A'la, Asy-Syams
            </span>
          )}
          {activeTab === "juz_amma" && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Surah Adh-Dhuha (93) s/d Surah An-Nas (114)
            </span>
          )}
          {activeTab === "all" && (
            <span>Menampilkan seluruh 114 Surah dalam Al-Qur'an</span>
          )}
        </div>
      </div>

      {/* Grid of Surah Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
        {filteredSurats.map((surat) => (
          <Link
            key={surat.nomor}
            href={`/surat/${surat.nomor}`}
            className="group relative bg-emerald-50/50 dark:bg-emerald-900 rounded-2xl p-6 shadow-sm hover:shadow-md border border-emerald-100 dark:border-emerald-800/50 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-semibold text-sm border border-emerald-200/50 dark:border-emerald-800/40 group-hover:bg-amber-500/15 group-hover:text-amber-600 transition-colors">
                {surat.nomor}
              </div>
              <div className="text-right">
                <h2 className="font-arabic text-2xl font-bold text-emerald-950 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {surat.nama}
                </h2>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-semibold text-emerald-950 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {surat.namaLatin}
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-slate-400 uppercase tracking-wider mt-1">
                  {surat.tempatTurun} • {surat.jumlahAyat} Ayat
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
