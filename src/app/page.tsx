import { getSuratList } from "@/services/api";
import VectorSearch from "@/components/VectorSearch";
import HomeBookmarkBar from "@/components/HomeBookmarkBar";
import SurahGrid from "@/components/SurahGrid";

export default async function Home() {
  const surats = await getSuratList();

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-amber-500 dark:from-emerald-400 dark:to-amber-300">
          Tartil Qur'an
        </h1>
        <p className="text-lg text-emerald-800/80 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          Baca - Dengar - Hafal - Paham
        </p>
        <VectorSearch />
      </div>

      {/* Riwayat Terakhir Dibaca & Quick Access Bookmark */}
      <HomeBookmarkBar />

      {/* Daftar Surah dengan Filter: Semua Surah, Surah Harian, & Juz Amma */}
      <SurahGrid surats={surats} />
    </main>
  );
}
