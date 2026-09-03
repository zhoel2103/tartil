const BASE_URL = 'https://equran.id/api/v2';

export interface Surat {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SuratDetail extends Surat {
  ayat: Ayat[];
  suratSelanjutnya: { nomor: number; nama: string; namaLatin: string; jumlahAyat: number } | false;
  suratSebelumnya: { nomor: number; nama: string; namaLatin: string; jumlahAyat: number } | false;
}

export interface TafsirAyat {
  ayat: number;
  teks: string;
}

export interface SuratTafsir extends Surat {
  tafsir: TafsirAyat[];
}

async function fetchWithRetry(url: string, retries = 3, delayMs = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (res.status === 404) return res; // Don't retry 404
      console.warn(`Fetch to ${url} returned status ${res.status}. Retrying (${i + 1}/${retries})...`);
    } catch (err) {
      console.warn(`Fetch to ${url} failed. Retrying (${i + 1}/${retries})...`, err);
    }
    await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
  }
  return fetch(url);
}

export const getSuratList = async (): Promise<Surat[]> => {
  const res = await fetchWithRetry(`${BASE_URL}/surat`);
  if (!res.ok) throw new Error('Failed to fetch surat list');
  const data = await res.json();
  return data.data;
};

export const getSuratDetail = async (nomor: number): Promise<SuratDetail> => {
  const res = await fetchWithRetry(`${BASE_URL}/surat/${nomor}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Failed to fetch surat ${nomor}. Status: ${res.status}, Body: ${errorText}`);
    throw new Error('Failed to fetch surat detail');
  }
  const data = await res.json();
  return data.data;
};

export const getSuratTafsir = async (nomor: number): Promise<SuratTafsir> => {
  const res = await fetchWithRetry(`${BASE_URL}/tafsir/${nomor}`);
  if (!res.ok) throw new Error('Failed to fetch surat tafsir');
  const data = await res.json();
  return data.data;
};

export interface SearchResult {
  tipe: 'surat' | 'ayat' | 'tafsir' | 'doa';
  skor: number;
  relevansi?: string;
  data: {
    id_surat?: number;
    nama_surat?: string;
    nama_surat_arab?: string;
    nomor_ayat?: number;
    teks_arab?: string;
    teks_latin?: string;
    terjemahan_id?: string;
    terjemahan_en?: string;
    isi?: string;
  };
}

export const searchVector = async (cari: string): Promise<SearchResult[]> => {
  const res = await fetch(`https://equran.id/api/vector`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ 
      cari: cari,
      batas: 5, 
      tipe: ['ayat', 'tafsir'],
      skorMin: 0.5
    })
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Vector search failed with status ${res.status}:`, text);
    throw new Error('Pencarian gagal');
  }
  const data = await res.json();
  console.log("Vector search API returned:", JSON.stringify(data, null, 2));
  
  // The API returns the array inside the `hasil` field
  if (data && Array.isArray(data.hasil)) return data.hasil;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};
