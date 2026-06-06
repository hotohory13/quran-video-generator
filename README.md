# Quran Video Generator 📖✨

Quran Video Generator is a cinematic web application built on **React**, **Vite**, and **Tailwind CSS**. It enables content creators, educators, and scholars to effortlessly compose, customize, and download high-fidelity recitation videos with beautiful audio, synchronized Quranic Arabic typography, translation text overlays, and gorgeous background videos.

---

## 🌟 Key Features

*   **🎙️ World-Class Qaris (Reciters):** Sourced directly from public audio streams like `EveryAyah.com`. Toggle between modern, clear audios by Mishary Al-Afasy, Al-Husary, Abdul Rahman Al-Sudais, and more.
*   **🌌 Dynamic Background Library:** Instantly search millions of royalty-free cinematic background videos from **Pexels** using keyword tags (e.g., "cosmic skies", "calming mountains", "ancient pathways") or paste a custom direct `.mp4` stream URL.
*   **🕌 High-Fidelity Arabic Typography & Custom Layouts:** Customize font pairings (Amiri, Scheherazade, Cairo) and size margins with meticulous layout spacing optimized to avoid overlapping diacritics.
*   **🎨 Canvas Art Customization:** Refine your output directly within the player dashboard:
    *   **Darkness Dimmer Mask:** Darken background videos seamlessly (0%–90%) for superior text readability and high contrast.
    *   **Translation Sizing:** Customize translation font dimensions for English (Sahih International).
    *   **Overlay & Custom Borders:** Enable watermark options with custom channel tags/names.
*   **📊 Integrated Audio Visualizer:** Dynamic sine-wave spectrum animation reacting directly to the recitation audio.
*   **⚡ Modern Client-Side Export (MediaRecorder pipeline):** Uses an optimized, zero-latency browser-based compiling flow. When recording, it captures a 25fps constant canvas frame and pairs it with the direct audio buffer to assemble a native `.mp4`/`.webm` download.
*   **⏰ Automatic Recording Stop-Triggers:** Start recording and walk away! The program detects when the playlist reaches the last selected verse in your run, automatically completes the compilation, stops recording, and prompts a lossless video download.

---

## 🛠️ Technology Stack

*   **Frontend:** React 18, Vite (Fast HMR/Module Resolution), TypeScript
*   **Aesthetics:** Tailwind CSS (Modern Glassmorphism & Cosmic dark slate palettes)
*   **APIs:**
    *   [Al Quran Cloud](https://alquran.cloud/api) (Arabic simple text & English translation schemas)
    *   [Pexels Video API](https://www.pexels.com/api/) (Royalty-free backdrop streams)
    *   [EveryAyah Recitations](https://www.everyayah.com) (Lossless verse-by-verse mp3 audios)
*   **Media Processing:** HTML5 canvas rendering contexts paired with standard Web Audio Node APIs and the `MediaRecorder` API.

---

## 💡 How to Use

Follow these simple steps to generate your first beautiful recitation slide:

### 1. Select Your Qari, Surah, and Range
*   Open the **Video Config** panel on the left sidebar.
*   Select your preferred reciter (e.g., Mishary Al-Afasy).
*   Choose your desired Surah from the dropdown. Only valid verse limits for the surah will be shown.
*   Define your **Start Verse** and **End Verse** boundaries.

### 2. Personalize the Watermark Overlay
*   Enter a custom string into the **Watermark Overlay** input field (e.g., `Quran Daily` or `@YourChannel`). This displays elegantly in the top margin of the output canvas.

### 3. Fetch Background Videos
*   Input natural scenic keywords (like `misty morning`, `relaxing rain`, or `night stars`) and click the **Search/Refresh** button to pull relevant, high-resolution backdrops.
*   *Optional:* Alternatively, you can paste any direct, raw URL linking directly to an online `.mp4` file to load a specific background.

### 4. Fine-Tune Styling (Canvas Art Styles)
*   Expand the **Canvas Art Styles** accordion segment.
*   Vary the **Black Dimmer Mask** range to apply the optimal dark overlay to ensure your translation and Arabic text contrasts perfectly against light background elements.
*   Adjust Arabic and English text sizes, select a preferred Arabic calligraphy style (Amiri, Scheherazade, or Cairo), and configure visualizer preferences.

### 5. Play and Review
*   Hover over the beautiful video viewport player to reveal the cinematic playback HUD controls.
*   Press **Play** to review audio synchronization, video playback flow, and subtitle alignments. Use the **Verse Forward/Backward** controls to hop between verses.

### 6. Record and Export
*   Once you are satisfied, click **Download Video**.
*   The video starts playing from your selected start verse, and recording is activated.
*   **Do not switch tabs or minimize the window during this compilation process.** Browsers throttle resources when tabs go out of focus, which might lead to dropped visual frames.
*   On the final verse, the compilation automatically stops and delivers a beautifully compiled, ready-to-share video.

---

## ⚠️ Important Production Tips & Guidance

1.  **Keep Active Tab Focus:** Because the recording compiles inside the browser utilizing your client GPU/CPU, keep the browser tab in the foreground while recording is active. Minimizing or shifting tabs will cause the browser to stop rendering animations to conserve resources, which stalls video progress.
2.  **Browser Compatibility:** 
    *   **Chrome/Brave/Edge:** Highly recommended. They fully support standard high-fidelity `video/mp4` and `video/webm` encoding.
    *   **Safari/Mac OS:** WebM/MP4 support is present but varies by macOS version. High-version Safari supports client-side canvas streaming flawlessly.
3.  **Direct MP4 Links:** Ensure custom URLs are direct raw video streams (`.mp4`) and not HTML container pages (such as YouTube, TikTok, or typical landing websites), as security firewalls block browser requests querying raw HTML.
