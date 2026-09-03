"use client";

import React from "react";
import Link from "next/link";
import { useBookmark } from "@/context/BookmarkContext";

export default function HomeBookmarkBar() {
  const { bookmarks, lastRead, setIsDrawerOpen } = useBookmark();

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 flex flex-wrap items-center justify-between gap-3 px-1">
      {/* Terakhir Dibaca Snippet */}
      {lastRead ? (
        <Link
          href={`/surat/${lastRead.suratNomor}#ayat-${lastRead.ayatNomor}`}
          className="flex-1 min-w-[260px] p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-amber-500/10 to-emerald-600/10 border border-emerald-200/60 dark:border-emerald-800/60 hover:border-amber-400/50 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Terakhir Dibaca
              </p>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {lastRead.suratNamaLatin} • Ayat {lastRead.ayatNomor}
              </h4>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
            Lanjut &rarr;
          </span>
        </Link>
      ) : (
        <div />
      )}

      {/* Button to Open Bookmarks Drawer */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-3 sm:py-3.5 rounded-2xl bg-emerald-100/60 dark:bg-emerald-900/40 hover:bg-amber-50 dark:hover:bg-amber-900/30 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-100 transition-all text-xs sm:text-sm font-medium shadow-sm hover:scale-[1.02]"
        title="Buka daftar bookmark Anda"
      >
        <svg className="w-4 h-4 fill-amber-500 text-amber-500" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <span>Bookmark Saya</span>
        {bookmarks.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-sm">
            {bookmarks.length}
          </span>
        )}
      </button>
    </div>
  );
}
