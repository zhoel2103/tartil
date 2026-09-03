"use server";

import { SearchResult, searchVector as apiSearchVector } from "@/services/api";

export async function searchVectorAction(cari: string): Promise<SearchResult[]> {
  try {
    const result = await apiSearchVector(cari);
    console.log(`Action got ${result.length} results`);
    return result;
  } catch (error) {
    console.error("Search vector action error:", error);
    throw new Error("Failed to search vector");
  }
}
