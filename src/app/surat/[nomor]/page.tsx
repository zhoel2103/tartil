import { getSuratDetail, getSuratTafsir } from "@/services/api";
import React from "react";
import { AudioProvider } from "@/context/AudioContext";
import SurahView from "@/components/SurahView";

// Statically pre-render all 114 Surahs for static export
export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    nomor: String(i + 1),
  }));
}

export const dynamicParams = false;

export default async function SuratDetail({ params }: { params: Promise<{ nomor: string }> }) {
  const resolvedParams = await params;
  const nomor = parseInt(resolvedParams.nomor);

  // Fetch both surat detail and tafsir concurrently
  const [surat, tafsirData] = await Promise.all([
    getSuratDetail(nomor),
    getSuratTafsir(nomor),
  ]);

  return (
    <AudioProvider>
      <SurahView surat={surat} tafsirData={tafsirData} nomor={nomor} />
    </AudioProvider>
  );
}
