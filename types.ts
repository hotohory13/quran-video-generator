export type ExportFormat = 'mp4' | 'webm';

export interface Reciter {
  id: string;
  name: string;
  subfolder: string; // The path part in EveryAyah URL
  bitrate?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number; // Global number
  numberInSurah: number;
  text: string; // Arabic
  translation?: string; // English
  audioUrl?: string; // Calculated URL
}

export interface VideoConfig {
  reciterId: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  channelName: string;
  videoPlaylist: string[]; // Changed from single URL to Array
  customVideoUrl?: string;
  exportFormat: ExportFormat;
  
  // Custom Visual Customizations
  arabicFont?: string; // 'amiri' | 'cairo' | 'scheherazade'
  fontSizeArabic?: number;
  fontSizeEnglish?: number;
  overlayOpacity?: number; // 0 to 0.9
  showBorder?: boolean;
  showVisualizer?: boolean;
}

// Pexels Types
export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  video_files: {
    id: number;
    quality: string; // 'hd', 'sd'
    file_type: string; // 'video/mp4'
    width: number;
    height: number;
    link: string;
  }[];
}

// API Response types for AlQuran Cloud
export interface QuranApiResponse {
  code: number;
  status: string;
  data: SurahData[];
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: ApiAyah[];
  edition?: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  };
}

export interface ApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
}