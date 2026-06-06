import { PexelsVideo } from '../types';

export const searchPexelsVideos = async (query: string): Promise<string[]> => {
  if (!query) return [];

  try {
    const response = await fetch("/api/pexels/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
        console.error(`Pexels API secure proxy error: ${response.status} ${response.statusText}`);
        return [];
    }

    const data = await response.json();

    if (data && data.videos && data.videos.length > 0) {
      // Filter for valid MP4s with good quality
      const validVideos = data.videos.filter((v: PexelsVideo) => v.video_files && v.video_files.length > 0);
      
      if (validVideos.length === 0) return [];

      // Extract best MP4 link from each video object
      const videoLinks: string[] = [];

      validVideos.forEach((video: PexelsVideo) => {
          const bestFile = video.video_files.find((f: any) => f.width === 1920 && f.file_type === 'video/mp4') 
                        || video.video_files.find((f: any) => f.width >= 1280 && f.file_type === 'video/mp4')
                        || video.video_files.find((f: any) => f.file_type === 'video/mp4');
          
          if (bestFile) {
              videoLinks.push(bestFile.link);
          }
      });

      // Shuffle the array to give variety
      for (let i = videoLinks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [videoLinks[i], videoLinks[j]] = [videoLinks[j], videoLinks[i]];
      }

      // Return top 5 unique videos
      return Array.from(new Set(videoLinks)).slice(0, 5);
    }
    
    console.warn("No videos found for query:", query);
    return [];
  } catch (error) {
    console.error("Pexels search secure exception:", error);
    return [];
  }
};