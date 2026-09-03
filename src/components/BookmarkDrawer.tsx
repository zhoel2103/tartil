"use client";

import React from "react";
import Link from "next/link";
import { useBookmark } from "@/context/BookmarkContext";

export default function BookmarkDrawer() {
  const {
    bookmarks,
    lastRead,
    isDrawerOpen,
    setIsDrawerOpen,
    removeBookmark,
  } = useBookmark();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-emerald-950 shadow-2xl border-l border-emerald-100 dark:border-emerald-800/80 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                <svg className="w-5 h-5 fill-amber-500" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
                  Riwayat & Bookmark
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-slate-400">
                  {bookmarks.length} Ayat Tersimpan
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/80 transition-colors"
              aria-label="Tutup"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Terakhir Dibaca Card */}
            {lastRead && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-100/70 to-amber-100/50 dark:from-emerald-900/60 dark:to-emerald-950/60 border border-amber-400/30 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Terakhir Dibaca
                  </span>
                  <span className="text-[10px] text-emerald-800/60 dark:text-slate-400">
                    {new Date(lastRead.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">
                  {lastRead.suratNamaLatin} • Ayat {lastRead.ayatNomor}
                </h4>
                <p className="text-xs text-emerald-900/80 dark:text-slate-300 mt-1 line-clamp-2">
                  {lastRead.teksIndonesia}
                </p>

                <Link
                  href={`/surat/${lastRead.suratNomor}#ayat-${lastRead.ayatNomor}`}
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  <span>Lanjutkan Membaca</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            )}

            {/* List of Bookmarks */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-400/80 mb-3">
                Daftar Bookmark ({bookmarks.length})
              </h4>

              {bookmarks.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                      Belum ada bookmark
                    </p>
                    <p className="text-xs text-emerald-700/70 dark:text-slate-400 mt-1">
                      Klik ikon bookmark pada ayat mana pun untuk menyimpannya ke daftar ini.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 hover:border-amber-500/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link
                          href={`/surat/${bm.suratNomor}#ayat-${bm.ayatNomor}`}
                          onClick={() => setIsDrawerOpen(false)}
                          className="font-bold text-emerald-950 dark:text-emerald-100 text-sm hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                          {bm.suratNamaLatin} : Ayat {bm.ayatNomor}
                        </Link>
                        <button
                          onClick={() => removeBookmark(bm.suratNomor, bm.ayatNomor)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                          title="Hapus bookmark"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <p
                        className="font-arabic text-right text-emerald-900 dark:text-emerald-200 text-lg leading-relaxed mb-2 line-clamp-1"
                        dir="rtl"
                      >
                        {bm.teksArab}
                      </p>

                      <p className="text-xs text-emerald-800/80 dark:text-slate-300 line-clamp-2">
                        {bm.teksIndonesia}
                      </p>

                      <div className="mt-3 pt-2 border-t border-emerald-100/50 dark:border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-700/60 dark:text-slate-400">
                        <span>
                          {new Date(bm.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <Link
                          href={`/surat/${bm.suratNomor}#ayat-${bm.ayatNomor}`}
                          onClick={() => setIsDrawerOpen(false)}
                          className="font-semibold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                          Buka Ayat &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
