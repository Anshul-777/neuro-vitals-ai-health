const BACKEND_URL = "https://neuro-vitual-x.onrender.com";
const WS_URL = "wss://neuro-vitual-x.onrender.com";

export const MODULE_BACKEND_MAP: Record<string, string> = {
  face_scan: "face",
  body_scan: "body",
  "3d_face": "face_3d",
};

export function getBackendModules(selectedModules: string[]): string[] {
  const set = new Set<string>();
  for (const m of selectedModules) {
    if (m === "face_scan") set.add("face");
    if (m === "body_scan") set.add("body");
    if (m === "3d_face") { set.add("face"); set.add("face_3d"); }
  }
  return Array.from(set);
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(30000) });
    return res.ok;
  } catch { return false; }
}

export async function analyzeVoice(audioBlob: Blob, sessionId?: string): Promise<any> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.wav");
  const url = new URL(`${BACKEND_URL}/api/v1/voice/analyze`);
  if (sessionId) url.searchParams.set("session_id", sessionId);
  const res = await fetch(url.toString(), { method: "POST", body: formData });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function refreshRisk(sessionId: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/v1/session/${sessionId}/risk`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to refresh risk");
  return res.json();
}

export async function getSessionResults(sessionId: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/v1/session/${sessionId}/results`);
  if (!res.ok) throw new Error("Failed to get results");
  return res.json();
}

export function createWebSocketUrl(): string {
  return `${WS_URL}/api/v1/analyze-stream`;
}

export function captureFrame(video: HTMLVideoElement, quality = 0.5): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function convertBlobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const samples = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  audioContext.close();
  return new Blob([buffer], { type: "audio/wav" });
}

export function formatWarning(w: string): string {
  switch (w) {
    case "low_signal_quality_check_lighting": return "Low signal quality — improve lighting on your face";
    case "face_not_detected": return "Face not detected — center your face in frame";
    case "frame_decode_failed": return "Frame processing error — hold still";
    default: return w.replace(/_/g, " ");
  }
}
