import { Reciter, Surah } from './types';

export const RECITERS: Reciter[] = [
  {
    id: 'abdulbasit-mujawwad',
    name: 'Abdul Basit (Mujawwad)',
    subfolder: 'Abdul_Basit_Mujawwad_128kbps'
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit (Murattal)',
    subfolder: 'Abdul_Basit_Murattal_192kbps'
  },
  {
    id: 'abdulsamad-quranexplorer',
    name: 'Abdul Basit Abdus Samad',
    subfolder: 'AbdulSamad_64kbps_QuranExplorer.Com'
  },
  {
    id: 'abdullah-juhany',
    name: 'Abdullah Awad Al-Juhany',
    subfolder: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps'
  },
  {
    id: 'abdullah-basfar',
    name: 'Abdullah Basfar',
    subfolder: 'Abdullah_Basfar_192kbps'
  },
  {
    id: 'abdullah-matroud',
    name: 'Abdullah Matroud',
    subfolder: 'Abdullah_Matroud_128kbps'
  },
  {
    id: 'sudais',
    name: 'Abdur-Rahman As-Sudais',
    subfolder: 'Abdurrahmaan_As-Sudais_192kbps'
  },
  {
    id: 'shatri',
    name: 'Abu Bakr Ash-Shatri',
    subfolder: 'Abu_Bakr_Ash-Shaatree_128kbps'
  },
  {
    id: 'ahmed-alajmy',
    name: 'Ahmed bin Ali Al-Ajmy',
    subfolder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net'
  },
  {
    id: 'ahmed-neana',
    name: 'Ahmed Neana',
    subfolder: 'Ahmed_Neana_128kbps'
  },
  {
    id: 'akram-alaqimy',
    name: 'Akram Al-Alaqimy',
    subfolder: 'Akram_AlAlaqimy_128kbps'
  },
  {
    id: 'alijaber',
    name: 'Ali Abdullah Jaber',
    subfolder: 'Ali_Jaber_64kbps'
  },
  {
    id: 'hudhaify',
    name: 'Ali Al-Huthaify',
    subfolder: 'Hudhaify_128kbps'
  },
  {
    id: 'ali-hajjaj-alsuesy',
    name: 'Ali Hajjaj Al-Suesy',
    subfolder: 'Ali_Hajjaj_AlSuesy_128kbps'
  },
  {
    id: 'ayman-sowaid',
    name: 'Ayman Sowaid',
    subfolder: 'Ayman_Sowaid_64kbps'
  },
  {
    id: 'aziz-alili',
    name: 'Aziz Alili',
    subfolder: 'aziz_alili_128kbps'
  },
  {
    id: 'fares-abbad',
    name: 'Fares Abbad',
    subfolder: 'Fares_Abbad_64kbps'
  },
  {
    id: 'hani-rifai',
    name: 'Hani Al-Rifai',
    subfolder: 'Hani_Rifai_192kbps'
  },
  {
    id: 'ibrahim-akhdar',
    name: 'Ibrahim Al-Akhdar',
    subfolder: 'Ibrahim_Akhdar_64kbps'
  },
  {
    id: 'karim-mansoori',
    name: 'Karim Mansoori',
    subfolder: 'Karim_Mansoori_40kbps'
  },
  {
    id: 'khalid-qahtani',
    name: 'Khalid Al-Qahtani',
    subfolder: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps'
  },
  {
    id: 'khalefa-al-tunaiji',
    name: 'Khalifa Al-Tunaiji',
    subfolder: 'khalefa_al_tunaiji_64kbps'
  },
  {
    id: 'maher-almuaiqly',
    name: 'Maher Al-Muaiqly',
    subfolder: 'MaherAlMuaiqly128kbps'
  },
  {
    id: 'mahmoud-ali-al-banna',
    name: 'Mahmoud Ali Al-Banna',
    subfolder: 'mahmoud_ali_al_banna_32kbps'
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    subfolder: 'Husary_128kbps'
  },
  {
    id: 'husary-muallim',
    name: 'Mahmoud Khalil Al-Husary (Muallim)',
    subfolder: 'Husary_Muallim_128kbps'
  },
  {
    id: 'husary-mujawwad',
    name: 'Mahmoud Khalil Al-Husary (Mujawwad)',
    subfolder: 'Husary_128kbps_Mujawwad'
  },
  {
    id: 'mishary',
    name: 'Mishary Rashid Alafasy',
    subfolder: 'Alafasy_128kbps'
  },
  {
    id: 'minshawy-mujawwad',
    name: 'Mohamed Siddiq El-Minshawi (Mujawwad)',
    subfolder: 'Minshawy_Mujawwad_192kbps'
  },
  {
    id: 'minshawy-murattal',
    name: 'Mohamed Siddiq El-Minshawi (Murattal)',
    subfolder: 'Minshawy_Murattal_128kbps'
  },
  {
    id: 'minshawy-teacher',
    name: 'Mohamed Siddiq El-Minshawi (Teacher)',
    subfolder: 'Minshawy_Teacher_128kbps'
  },
  {
    id: 'mohammad-tablaway',
    name: 'Mohammad Al-Tablaway',
    subfolder: 'Mohammad_al_Tablaway_128kbps'
  },
  {
    id: 'muhammad-abdulkareem',
    name: 'Muhammad Abdul Kareem',
    subfolder: 'Muhammad_AbdulKareem_128kbps'
  },
  {
    id: 'muhammad-ayyoub',
    name: 'Muhammad Ayyoub',
    subfolder: 'Muhammad_Ayyoub_128kbps'
  },
  {
    id: 'muhammad-jibreel',
    name: 'Muhammad Jibreel',
    subfolder: 'Muhammad_Jibreel_128kbps'
  },
  {
    id: 'muhsin-alqasim',
    name: 'Muhsin Al-Qasim',
    subfolder: 'Muhsin_Al_Qasim_192kbps'
  },
  {
    id: 'mustafa-ismail',
    name: 'Mustafa Ismail',
    subfolder: 'Mustafa_Ismail_48kbps'
  },
  {
    id: 'nabil-rifai',
    name: 'Nabil Al-Rifai',
    subfolder: 'Nabil_Rifa3i_48kbps'
  },
  {
    id: 'nasser-alqatami',
    name: 'Nasser Al-Qatami',
    subfolder: 'Nasser_Alqatami_128kbps'
  },
  {
    id: 'ghamadi',
    name: 'Saad Al-Ghamdi',
    subfolder: 'Ghamadi_40kbps'
  },
  {
    id: 'sahl-yassin',
    name: 'Sahl Yassin',
    subfolder: 'Sahl_Yassin_128kbps'
  },
  {
    id: 'salah-budair',
    name: 'Salah Al-Budair',
    subfolder: 'Salah_Al_Budair_128kbps'
  },
  {
    id: 'salah-bukhatir',
    name: 'Salah Abdul Rahman Bukhatir',
    subfolder: 'Salaah_AbdulRahman_Bukhatir_128kbps'
  },
  {
    id: 'shuraym',
    name: 'Saud Al-Shuraim',
    subfolder: 'Saood_ash-Shuraym_128kbps'
  },
  {
    id: 'parhizgar',
    name: 'Shahriar Parhizgar',
    subfolder: 'Parhizgar_48kbps'
  },
  {
    id: 'yaser-salamah',
    name: 'Yaser Salamah',
    subfolder: 'Yaser_Salamah_128kbps'
  },
  {
    id: 'yasser-dussary',
    name: 'Yasser Al-Dosari',
    subfolder: 'Yasser_Ad-Dussary_128kbps'
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