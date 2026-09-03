import { getSuratList } from "@/services/api";
import Link from "next/link";
import VectorSearch from "@/components/VectorSearch";

export default async function Home() {
  const surats = await getSuratList();

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-amber-500 dark:from-emerald-400 dark:to-amber-300">
          Tartil Qur'an
        </h1>
        <p className="text-lg text-emerald-800/80 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          Baca AlQuran dengan terjemahan dan tafsir lengkap.
        </p>
        <VectorSearch />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {surats.map((surat) => (
          <Link
            key={surat.nomor}
            href={`/surat/${surat.nomor}`}
            className="group relative bg-emerald-50/50 dark:bg-emerald-900 rounded-2xl p-6 shadow-sm hover:shadow-md border border-emerald-100 dark:border-emerald-800/50 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
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
                <h3 className="font-semibold text-emerald-950 dark:text-slate-100">
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
    </main>
  );
}
