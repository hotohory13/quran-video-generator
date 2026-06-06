import { Reciter, Surah } from './types';

export const RECITERS: Reciter[] = [
  {
    id: 'mishary',
    name: 'Mishary Rashid Alafasy',
    subfolder: 'Alafasy_128kbps'
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit (Murattal)',
    subfolder: 'Abdul_Basit_Murattal_64kbps'
  },
  {
    id: 'shatri',
    name: 'Abu Bakr Ash-Shaatree',
    subfolder: 'Abu_Bakr_Ash-Shaatree_128kbps'
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    subfolder: 'Husary_128kbps'
  },
  {
    id: 'sudais',
    name: 'Abdur-Rahman as-Sudais',
    subfolder: 'Abdurrahmaan_As-Sudais_192kbps'
  },
  {
    id: 'ghamadi',
    name: 'Saad Al-Ghamdi',
    subfolder: 'Ghamadi_40kbps'
  }
];

export const PEXELS_API_KEY = "15LieZ3mueupQ9jnfXmsVfEcryZGDNwTITTVIgBM5o4aCeXLYPV5grBh";
export const DEFAULT_BACKGROUND_VIDEO = "https://videos.pexels.com/video-files/856973/856973-hd_1920_1080_25fps.mp4"; // Nature
export const EVERYAYAH_BASE_URL = "https://www.everyayah.com/data/";

// Simplified list of first 10 Surahs + key ones
export const SURAH_LIST_SIMPLE: Surah[] = [
  { number: 1, name: "Al-Fatihah", englishName: "The Opener", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "Al-Baqarah", englishName: "The Cow", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "Ali 'Imran", englishName: "Family of Imran", englishNameTranslation: "Family of Imran", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, name: "An-Nisa", englishName: "The Women", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 18, name: "Al-Kahf", englishName: "The Cave", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 36, name: "Ya-Sin", englishName: "Ya Sin", englishNameTranslation: "Ya Sin", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 55, name: "Ar-Rahman", englishName: "The Beneficent", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 67, name: "Al-Mulk", englishName: "The Sovereignty", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 112, name: "Al-Ikhlas", englishName: "The Sincerity", englishNameTranslation: "The Sincerity", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 113, name: "Al-Falaq", englishName: "The Daybreak", englishNameTranslation: "The Daybreak", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 114, name: "An-Nas", englishName: "Mankind", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan" }
];