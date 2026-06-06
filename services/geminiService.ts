export interface VeoStatusResult {
  done: boolean;
  status: string;
}

/**
 * Initiates the AI video generation on the server.
 * Returns the operationName for polling.
 */
export const startVeoGeneration = async (prompt: string): Promise<string> => {
  const res = await fetch("/api/generate-video", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ prompt })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to start AI video generation");
  }
  
  const data = await res.json();
  return data.operationName;
};

/**
 * Polls the current status of the video generation operation on the server.
 */
export const checkVeoStatus = async (operationName: string): Promise<VeoStatusResult> => {
  const res = await fetch("/api/video-status", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ operationName })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to poll AI video generation state");
  }
  
  return await res.json();
};

/**
 * Returns a secure, CORS-enabled URL for the browser to stream/download the finished video.
 */
export const getVeoDownloadUrl = (operationName: string): string => {
  return `/api/video-download?operationName=${encodeURIComponent(operationName)}`;
};
