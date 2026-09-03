import { getSuratDetail, getSuratTafsir } from "@/services/api";
import Link from "next/link";
import React from "react";
import AyatCard from "@/components/AyatCard";
import { AudioProvider } from "@/context/AudioContext";
import SurahPlayer from "@/components/SurahPlayer";

export default async function SuratDetail({ params }: { params: Promise<{ nomor: string }> }) {
  const resolvedParams = await params;
  const nomor = parseInt(resolvedParams.nomor);
  
  // Fetch both surat detail and tafsir concurrently
  const [surat, tafsirData] = await Promise.all([
    getSuratDetail(nomor),
    getSuratTafsir(nomor)
  ]);

  return (
    <AudioProvider>
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header Navigation */}
        <div className="mb-8">
          <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center">
            &larr; Kembali ke Daftar Surat
          </Link>
        </div>

        {/* Surat Info Card */}
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-800 rounded-3xl p-8 md:p-12 text-white text-center shadow-lg mb-12 relative overflow-hidden ring-4 ring-amber-500/20">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-arabic mb-4 font-bold drop-shadow-md">{surat.nama}</h1>
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
          const tafsirAyat = tafsirData.tafsir.find(t => t.ayat === ayat.nomorAyat);
          
          return (
            <AyatCard 
              key={ayat.nomorAyat} 
              ayat={ayat} 
              tafsirHtml={tafsirAyat?.teks} 
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
        ) : <div />}
        
        {surat.suratSelanjutnya ? (
          <Link 
            href={`/surat/${surat.suratSelanjutnya.nomor}`}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-slate-100 dark:bg-emerald-900 text-emerald-900/90 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-500 transition-colors font-medium flex items-center gap-3 justify-center border border-transparent hover:border-amber-200 dark:hover:border-amber-800 text-sm sm:text-base"
          >
            {surat.suratSelanjutnya.namaLatin} &rarr;
          </Link>
        ) : <div />}
      </div>
    </main>
    </AudioProvider>
  );
}
