"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import type { Ayat } from "@/services/api";

interface AudioContextType {
  activeAyatNomor: number | null;
  setActiveAyatNomor: (nomor: number | null) => void;
  isPlayingGlobal: boolean;
  setIsPlayingGlobal: (playing: boolean) => void;
  playNextAyat: () => void;
  ayats: Ayat[];
  setAyats: (ayats: Ayat[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeAyatNomor, setActiveAyatNomor] = useState<number | null>(null);
  const [isPlayingGlobal, setIsPlayingGlobal] = useState(false);
  const [ayats, setAyats] = useState<Ayat[]>([]);

  const playNextAyat = () => {
    if (activeAyatNomor === null) return;
    
    const currentIndex = ayats.findIndex(a => a.nomorAyat === activeAyatNomor);
    if (currentIndex >= 0 && currentIndex < ayats.length - 1) {
      setActiveAyatNomor(ayats[currentIndex + 1].nomorAyat);
    } else {
      // Reached the end
      setActiveAyatNomor(null);
      setIsPlayingGlobal(false);
    }
  };

  return (
    <AudioContext.Provider value={{
      activeAyatNomor,
      setActiveAyatNomor,
      isPlayingGlobal,
      setIsPlayingGlobal,
      playNextAyat,
      ayats,
      setAyats
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
