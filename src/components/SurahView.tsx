"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { SuratDetail, SuratTafsir } from "@/services/api";
import AyatCard from "@/components/AyatCard";
import SurahPlayer from "@/components/SurahPlayer";

interface SurahViewProps {
  surat: SuratDetail;
  tafsirData: SuratTafsir;
  nomor: number;
}

export default function SurahView({ surat, tafsirData, nomor }: SurahViewProps) {
  // Mode Hafalan State
  const [isHafalanMode, setIsHafalanMode] = useState(false);
  // Map of ayat numbers that have been successfully unlocked via voice or manually
  const [unlockedAyatMap, setUnlockedAyatMap] = useState<Record<number, boolean>>({});

  const handleUnlockAyat = (ayatNomor: number) => {
    setUnlockedAyatMap((prev) => ({
      ...prev,
      [ayatNomor]: true,
    }));
  };

  const handleToggleHafalanMode = () => {
    setIsHafalanMode((prev) => !prev);
  };

  const handleResetHafalan = () => {
    setUnlockedAyatMap({});
  };

  const handleRevealAll = () => {
    const allUnlocked: Record<number, boolean> = {};
    surat.ayat.forEach((a) => {
      allUnlocked[a.nomorAyat] = true;
    });
    setUnlockedAyatMap(allUnlocked);
  };

  const unlockedCount = Object.values(unlockedAyatMap).filter(Boolean).length;
  const progressPercent =
    surat.jumlahAyat > 0 ? Math.round((unlockedCount / surat.jumlahAyat) * 100) : 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header Navigation & Mode Hafalan Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Link
          href="/"
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1.5 text-sm sm:text-base"
        >
          <span>&larr;</span> Kembali ke Daftar Surat
        </Link>

        {/* Toggle Mode Hafalan */}
        <div className="flex items-center gap-3 bg-emerald-100/60 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 p-1.5 sm:p-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Mode Hafalan
            </span>
          </div>

          <button
            onClick={handleToggleHafalanMode}
            type="button"
            role="switch"
            aria-checked={isHafalanMode}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              isHafalanMode ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span className="sr-only">Aktifkan Mode Hafalan</span>
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isHafalanMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Hafalan Progress & Controller Banner (Visible when Hafalan Mode is ON) */}
      {isHafalanMode && (
        <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border border-amber-500/30 dark:border-amber-400/20 shadow-md backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                  Aktif
                </span>
                <h3 className="font-bold text-emerald-950 dark:text-emerald-100 text-base sm:text-lg">
                  Target Hafalan: {surat.namaLatin}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-slate-300 mt-1">
                Teks Arab disembunyikan. Tekan tombol <strong>Lafazkan</strong> pada setiap ayat untuk menguji hafalan Anda dengan AI suara.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {unlockedCount} / {surat.jumlahAyat}
              </span>
              <p className="text-xs text-emerald-700/70 dark:text-slate-400">Ayat Terbuka</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200/80 dark:bg-emerald-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-amber-500/20 text-xs">
            <span className="text-emerald-900/70 dark:text-slate-400 font-medium">
              Progress: {progressPercent}% selesai
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetHafalan}
                className="px-3 py-1.5 rounded-lg bg-white/70 dark:bg-emerald-900/60 hover:bg-white dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 transition-colors border border-emerald-200 dark:border-emerald-700"
              >
                Kunci Semua Teks
              </button>
              <button
                onClick={handleRevealAll}
                className="px-3 py-1.5 rounded-lg bg-white/70 dark:bg-emerald-900/60 hover:bg-white dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 transition-colors border border-emerald-200 dark:border-emerald-700"
              >
                Buka Semua Teks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Surat Info Card */}
      <div className="bg-gradient-to-br from-emerald-950 to-emerald-800 rounded-3xl p-8 md:p-12 text-white text-center shadow-lg mb-12 relative overflow-hidden ring-4 ring-amber-500/20">
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-arabic mb-4 font-bold drop-shadow-md">
            {surat.nama}
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">{surat.namaLatin}</h2>
          <div className="flex items-center justify-center space-x-2 text-emerald-50 mb-6 text-sm sm:text-base">
            <span>{surat.arti}</span>
          </div>
          <div className="inline-flex items-center px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full text-sm font-medium uppercase tracking-widest border border-amber-400/30 text-amber-100">
            {surat.tempatTurun} • {surat.jumlahAyat} AYAT
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-950/40 rounded-full blur-3xl"></div>
      </div>

      {/* Audio Player (Global/Full Surat) */}
      <SurahPlayer
        suratName={surat.namaLatin}
        qari="Misyari Rasyid Al-Afasy"
        ayats={surat.ayat}
      />

      {/* Bismillah */}
      {nomor !== 1 && nomor !== 9 && (
        <div className="text-center py-10 mb-8 border-b border-slate-200 dark:border-slate-800">
          <p className="font-arabic text-4xl md:text-5xl leading-loose text-emerald-950 dark:text-slate-100">
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
        </div>
      )}

      {/* Ayats List */}
      <div className="space-y-10">
        {surat.ayat.map((ayat) => {
          const tafsirAyat = tafsirData.tafsir.find((t) => t.ayat === ayat.nomorAyat);

          return (
            <AyatCard
              key={ayat.nomorAyat}
              ayat={ayat}
              tafsirHtml={tafsirAyat?.teks}
              isHafalanMode={isHafalanMode}
              isUnlocked={Boolean(unlockedAyatMap[ayat.nomorAyat])}
              onUnlock={handleUnlockAyat}
            />
          );
        })}
      </div>

      {/* Navigation Next/Prev */}
      <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-4">
        {surat.suratSebelumnya ? (
          <Link
            href={`/surat/${surat.suratSebelumnya.nomor}`}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-slate-100 dark:bg-emerald-900 text-emerald-900/90 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-500 transition-colors font-medium flex items-center gap-3 justify-center border border-transparent hover:border-amber-200 dark:hover:border-amber-800 text-sm sm:text-base"
          >
            &larr; {surat.suratSebelumnya.namaLatin}
          </Link>
        ) : (
          <div />
        )}

        {surat.suratSelanjutnya ? (
          <Link
            href={`/surat/${surat.suratSelanjutnya.nomor}`}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-slate-100 dark:bg-emerald-900 text-emerald-900/90 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-500 transition-colors font-medium flex items-center gap-3 justify-center border border-transparent hover:border-amber-200 dark:hover:border-amber-800 text-sm sm:text-base"
          >
            {surat.suratSelanjutnya.namaLatin} &rarr;
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}
