import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";

// Pexels API Key moved from client to secure server environment
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "15LieZ3mueupQ9jnfXmsVfEcryZGDNwTITTVIgBM5o4aCeXLYPV5grBh";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

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
