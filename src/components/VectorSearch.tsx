"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchResult, searchVector } from "@/services/api";

export default function VectorSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    try {
      const data = await searchVector(searchQuery);
      setResults(data);
    } catch (err) {
      setError("Terjadi kesalahan saat mencari. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    performSearch(tag);
  };

  const exampleTags = [
    "surah al-Baqarah ayat 255",
    "hukum riba",
    "kisah Nabi Musa",
    "khusyuk dalam shalat",
    "sabar menghadapi cobaan",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-16">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pencarian Semantik ..."
          className="w-full px-4 sm:px-6 py-4 rounded-2xl border-2 border-emerald-100/50 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900 text-emerald-950 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all text-base sm:text-lg shadow-sm pr-20 sm:pr-28"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 sm:right-3 sm:top-3 sm:bottom-3 px-4 sm:px-6 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-200/50 dark:disabled:bg-teal-900/50 text-white disabled:text-emerald-800/40 dark:disabled:text-emerald-200/40 font-medium rounded-xl transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          {loading ? "..." : "Cari"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-emerald-700/80 dark:text-slate-400 mr-1">Contoh:</span>
        {exampleTags.map((tag, index) => (
          <button
            key={index}
            onClick={() => handleTagClick(tag)}
            className="text-xs px-3 py-1.5 rounded-full bg-emerald-100/50 hover:bg-amber-50 text-emerald-800/80 hover:text-amber-700 dark:bg-emerald-900 dark:text-slate-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-colors border border-slate-200 dark:border-emerald-800/50 hover:border-amber-200 dark:hover:border-amber-800"
          >
            {tag}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-emerald-700/80 uppercase tracking-wider mb-4">Hasil Pencarian Semantik</h3>
          {results.map((res, i) => (
            <Link
              href={`/surat/${res.data.id_surat}#ayat-${res.data.nomor_ayat}`}
              key={i}
              className="block bg-emerald-50/50 dark:bg-emerald-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all text-left"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  {res.tipe.charAt(0).toUpperCase() + res.tipe.slice(1)}
                </span>
                <span className="text-xs text-slate-400">Skor: {(res.skor * 100).toFixed(0)}%</span>
              </div>

              <h4 className="font-semibold text-emerald-950 dark:text-slate-100 mb-2">
                Surat {res.data.nama_surat} Ayat {res.data.nomor_ayat}
              </h4>

              {res.data.terjemahan_id && (
                <p className="text-emerald-800/80 dark:text-slate-300 text-sm italic mb-3">
                  "{res.data.terjemahan_id}"
                </p>
              )}

              {res.data.isi && (
                <p className="text-emerald-800/80 dark:text-slate-400 text-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: res.data.isi }} />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
