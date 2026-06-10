import { EVERYAYAH_BASE_URL, RECITERS } from '../constants';
import { ApiAyah, Ayah, QuranApiResponse, Surah } from '../types';

// Helper to pad numbers to 3 digits (e.g., 1 -> "001")
const pad3 = (num: number): string => {
  return num.toString().padStart(3, '0');
};

export const fetchSurahList = async (): Promise<Surah[]> => {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    if (data.code === 200) {
      return data.data;
    }
    return [];
  } catch (e) {
    console.error("Failed to fetch surah list", e);
    return [];
  }
};

export const fetchAyahs = async (surahNumber: number, start: number, end: number, reciterId: string): Promise<Ayah[]> => {
  try {
    // We fetch two editions: Simple Arabic and English Sahih
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-simple,en.sahih`);
    const result: QuranApiResponse = await response.json();

    if (result.code !== 200 || !result.data || result.data.length < 2) {
      throw new Error("Failed to fetch ayah data");
    }

    const arabicData = result.data.find(d => d.edition?.language === 'ar')?.ayahs || [];
    const englishData = result.data.find(d => d.edition?.language === 'en')?.ayahs || [];

    // Filter by range
    const filteredArabic = arabicData.filter((a: ApiAyah) => a.numberInSurah >= start && a.numberInSurah <= end);
    const filteredEnglish = englishData.filter((a: ApiAyah) => a.numberInSurah >= start && a.numberInSurah <= end);

    const reciterObj = RECITERS.find(r => r.id === reciterId) || RECITERS[0];

    // Combine
    const ayahs: Ayah[] = filteredArabic.map((arAyah: ApiAyah, index: number) => {
      const enAyah = filteredEnglish[index];
      
      // Strip Basmala from verse 1 for all surahs except Al-Fatihah (Surah 1)
      let cleanText = arAyah.text ? arAyah.text.trim() : '';
      if (surahNumber !== 1 && arAyah.numberInSurah === 1) {
        const basmalaRegex = /^(?:بِسْمِ|بِسمِ|بِسْمُ|بِسمُ|بِسْم|بِسم|بِّسْمِ)\s+(?:اللَّهِ|اللهِ|اللّهِ|اللَّه|الله)\s+(?:الرَّحْمَٰنِ|الرَّحْمٰنِ|الرَّحْمَنِ|الرَّحْمَن|الرَّحْمَٰن|الرحمان)\s+(?:الرَّحِيمِ|الرَّحِيْمِ|الرَّحِيم|الرَّحِيْم|الرحيم)\s*/;
        cleanText = cleanText.replace(basmalaRegex, '');
      }

      // Construct Audio URL: https://www.everyayah.com/data/Reciter_Folder/SSSVVV.mp3
      const surahPad = pad3(surahNumber);
      const ayahPad = pad3(arAyah.numberInSurah);
      const rawAudioUrl = `${EVERYAYAH_BASE_URL}${reciterObj.subfolder}/${surahPad}${ayahPad}.mp3`;
      const audioUrl = `/api/audio-proxy?url=${encodeURIComponent(rawAudioUrl)}`;

      return {
        number: arAyah.number,
        numberInSurah: arAyah.numberInSurah,
        text: cleanText,
        translation: enAyah ? enAyah.text : '',
        audioUrl: audioUrl
      };
    });

    return ayahs;

  } catch (error) {
    console.error("Error fetching ayahs:", error);
    return [];
  }
};
