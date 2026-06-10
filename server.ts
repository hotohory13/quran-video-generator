import express from "express";
import cors from "cors";
import path from "path";
import https from "https";
import http from "http";
import { createServer as createViteServer } from "vite";

// Helper to download audio from EveryAyah on the backend with fallback mechanisms and SSL ignore
function fetchAudioWithFallback(url: string): Promise<{ data: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https:");
    const client = isHttps ? https : http;
    
    const parsedUrl = new URL(url);
    const options: any = {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebView/1.0"
      }
    };
    
    if (isHttps) {
      options.rejectUnauthorized = false; // Bypasses potential SSL/certificate mismatch errors on EveryAyah
    }

    client.get(options, (res) => {
      // Handle redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        fetchAudioWithFallback(redirectUrl).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Server returned status ${res.statusCode}`));
        return;
      }

      const contentType = res.headers["content-type"] || "";
      if (contentType.includes("text/html")) {
        reject(new Error("Received HTML index page instead of audio stream. Possible invalid reciter folder or 404 page."));
        return;
      }

      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          data: Buffer.concat(chunks),
          contentType: contentType || "audio/mpeg"
        });
      });
      res.on("error", (err) => {
        reject(err);
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

// Pexels API Key moved from client to secure server environment
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "15LieZ3mueupQ9jnfXmsVfEcryZGDNwTITTVIgBM5o4aCeXLYPV5grBh";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

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

  // Dedicated Audio Proxy Endpoint to safely bypass CORS/Mixed-Content/SSL certificate validation blockages
  app.get("/api/audio-proxy", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "Missing url parameter" });
      }

      // Security check: only allow everyayah.com URLs
      const parsedUrl = new URL(url);
      if (!parsedUrl.hostname.endsWith("everyayah.com")) {
        return res.status(400).json({ error: "Unauthorized target host" });
      }

      const urlsToTry = [url];
      
      const isHttps = url.startsWith("https://");
      const hasWww = url.includes("www.everyayah.com");
      
      // Combinations of subdomains
      const altSub = hasWww ? url.replace("www.everyayah.com", "everyayah.com") : url.replace("everyayah.com", "www.everyayah.com");
      if (!urlsToTry.includes(altSub)) urlsToTry.push(altSub);
      
      // HTTP versions
      if (isHttps) {
        const httpUrl1 = url.replace("https://", "http://");
        if (!urlsToTry.includes(httpUrl1)) urlsToTry.push(httpUrl1);
        
        const httpUrl2 = altSub.replace("https://", "http://");
        if (!urlsToTry.includes(httpUrl2)) urlsToTry.push(httpUrl2);
      }

      let result = null;
      let lastError = null;

      for (const targetUrl of urlsToTry) {
        try {
          result = await fetchAudioWithFallback(targetUrl);
          break; // Succeeded!
        } catch (e: any) {
          console.warn(`Fetch failed for: ${targetUrl}. Reason: ${e.message}`);
          lastError = e;
        }
      }

      if (!result) {
        console.error("All audio proxy fallback attempts failed.");
        return res.status(500).json({ error: "Could not stream audio from EveryAyah: " + (lastError?.message || "Unknown error") });
      }

      // Serve audio file with proper headers, wildcard CORS, and HTML5 standard Range request compatibility
      const totalLength = result.data.length;
      const rangeHeader = req.headers.range;

      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day cache

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;

        if (start >= totalLength || end >= totalLength) {
          res.setHeader("Content-Range", `bytes */${totalLength}`);
          return res.status(416).send("Requested Range Not Satisfiable");
        }

        const chunksize = (end - start) + 1;
        const slicedBuffer = result.data.subarray(start, end + 1);

        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${totalLength}`);
        res.setHeader("Content-Length", chunksize);
        res.setHeader("Content-Type", result.contentType);
        res.send(slicedBuffer);
      } else {
        res.setHeader("Content-Length", totalLength);
        res.setHeader("Content-Type", result.contentType);
        res.status(200).send(result.data);
      }

    } catch (err: any) {
      console.error("Audio proxy main execution exception:", err);
      res.status(500).json({ error: "Audio proxy exception: " + err.message });
    }
  });

  // Dedicated Favicon Handlers to bypass aggressive browser caching and avoid returning HTML for favicon requests
  app.get(["/favicon.ico", "/favicon.png"], (req, res) => {
    const svgIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='11' fill='#1e293b'/><rect x='6' y='6' width='12' height='12' rx='1.5' fill='#b45309' stroke='#fbbf24' stroke-width='1.5'/><rect x='6' y='6' width='12' height='12' rx='1.5' fill='#b45309' stroke='#fbbf24' stroke-width='1.5' transform='rotate(45 12 12)'/><circle cx='12' cy='12' r='4' fill='#78350f' stroke='#fbbf24' stroke-width='1'/><circle cx='12' cy='12' r='1' fill='#fffbeb'/></svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.send(svgIcon);
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
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
