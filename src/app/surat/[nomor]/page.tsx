import { getSuratDetail, getSuratTafsir } from "@/services/api";
import React from "react";
import { AudioProvider } from "@/context/AudioContext";
import SurahView from "@/components/SurahView";

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
