"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface BookmarkItem {
  id: string; // "surat:ayat" e.g. "1:2"
  suratNomor: number;
  suratNama: string;
  suratNamaLatin: string;
  ayatNomor: number;
  teksArab: string;
  teksIndonesia: string;
  createdAt: number;
}

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  lastRead: BookmarkItem | null;
  isBookmarked: (suratNomor: number, ayatNomor: number) => boolean;
  toggleBookmark: (item: Omit<BookmarkItem, "id" | "createdAt">) => boolean;
  removeBookmark: (suratNomor: number, ayatNomor: number) => void;
  setAsLastRead: (item: Omit<BookmarkItem, "id" | "createdAt">) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const STORAGE_KEY = "tartil_quran_bookmarks";
const LAST_READ_KEY = "tartil_quran_last_read";

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [lastRead, setLastRead] = useState<BookmarkItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }

      const savedLastRead = localStorage.getItem(LAST_READ_KEY);
      if (savedLastRead) {
        setLastRead(JSON.parse(savedLastRead));
      }
    } catch (e) {
      console.error("Failed to load bookmarks from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error("Failed to save bookmarks", e);
    }
  }, [bookmarks, isLoaded]);

  // Save lastRead to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (lastRead) {
        localStorage.setItem(LAST_READ_KEY, JSON.stringify(lastRead));
      }
    } catch (e) {
      console.error("Failed to save last read", e);
    }
  }, [lastRead, isLoaded]);

  const isBookmarked = (suratNomor: number, ayatNomor: number) => {
    const id = `${suratNomor}:${ayatNomor}`;
    return bookmarks.some((b) => b.id === id);
  };

  const toggleBookmark = (item: Omit<BookmarkItem, "id" | "createdAt">): boolean => {
    const id = `${item.suratNomor}:${item.ayatNomor}`;
    const exists = bookmarks.some((b) => b.id === id);

    if (exists) {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      return false; // unbookmarked
    } else {
      const newBookmark: BookmarkItem = {
        ...item,
        id,
        createdAt: Date.now(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
      return true; // bookmarked
    }
  };

  const removeBookmark = (suratNomor: number, ayatNomor: number) => {
    const id = `${suratNomor}:${ayatNomor}`;
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const setAsLastRead = (item: Omit<BookmarkItem, "id" | "createdAt">) => {
    const newLastRead: BookmarkItem = {
      ...item,
      id: `${item.suratNomor}:${item.ayatNomor}`,
      createdAt: Date.now(),
    };
    setLastRead(newLastRead);
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        lastRead,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        setAsLastRead,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmark() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmark must be used within a BookmarkProvider");
  }
  return context;
}
