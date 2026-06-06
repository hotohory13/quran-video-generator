import express from "express";
import cors from "cors";
import path from "path";
import { Readable } from "stream";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Initialize Gemini SDK with telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Pexels API Key moved from client to secure server environment
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "15LieZ3mueupQ9jnfXmsVfEcryZGDNwTITTVIgBM5o4aCeXLYPV5grBh";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // 1. Veo API: Start Video Generation
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      console.log(`Starting Veo generation for prompt: "${prompt}"`);
      
      // Use veo-3.1-lite-generate-preview for general purpose video generation
      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: `Cinematic background, looping style, peaceful, high quality, ${prompt}`,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      console.log(`Veo generation started successfully. Operation Name: ${operation.name}`);
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error("Failed to start Veo video generation:", error);
      res.status(500).json({ error: error.message || "Failed to start AI video generation" });
    }
  });

  // 2. Veo API: Poll Video Status
  app.post("/api/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "operationName is required" });
      }

      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ op } as any);
      res.json({ done: updated.done, status: updated.metadata?.status || "processing" });
    } catch (error: any) {
      console.error("Failed to fetch Veo operation status:", error);
      res.status(500).json({ error: error.message || "Failed to fetch video status" });
    }
  });

  // 3. Veo API: Stream Resulting Video to Client (Bypasses CORS limitations)
  app.get("/api/video-download", async (req, res) => {
    try {
      const { operationName } = req.query;
      if (!operationName) {
        return res.status(400).send("operationName query parameter is required");
      }

      const op = new GenerateVideosOperation();
      op.name = operationName as string;

      const updated = await ai.operations.getVideosOperation({ op } as any);
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        return res.status(404).send("Generated video URI not found. The operation might still be in progress.");
      }

      console.log(`Proxying Veo download from URI: ${uri}`);

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY! },
      });

      if (!videoRes.ok) {
        throw new Error(`Failed to download video from Google: ${videoRes.statusText}`);
      }

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename="veo-background.mp4"');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (videoRes.body) {
        Readable.fromWeb(videoRes.body as any).pipe(res);
      } else {
        const arrayBuf = await videoRes.arrayBuffer();
        res.send(Buffer.from(arrayBuf));
      }
    } catch (error: any) {
      console.error("Failed stream/download for Veo video:", error);
      res.status(500).send(error.message || "Failed to download generated video");
    }
  });

  // 4. Pexels API: Search Pexels securely on the server
  app.post("/api/pexels/search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.json({ videos: [] });
      }

      const encodedQuery = encodeURIComponent(query);
      const url = `https://api.pexels.com/videos/search?query=${encodedQuery}&per_page=15&orientation=landscape&size=medium&_t=${Date.now()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: PEXELS_API_KEY
        }
      });

      if (!response.ok) {
        console.error(`Pexels API return error: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ error: "Failed to search Pexels" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Pexels search server error:", error);
      res.status(500).json({ error: "Failed to seek Pexels videos" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
