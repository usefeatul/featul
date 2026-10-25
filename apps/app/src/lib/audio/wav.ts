const SAMPLE_RATE = 16_000;
// 30 ms analysis frames; a frame counts as voiced above ~-34 dBFS RMS.
const FRAME_SIZE = 480;
const VOICED_RMS = 0.02;

/** Seconds of the clip loud enough to plausibly be speech. */
function voicedSeconds(samples: Float32Array) {
  let voicedFrames = 0;
  for (let start = 0; start < samples.length; start += FRAME_SIZE) {
    const end = Math.min(start + FRAME_SIZE, samples.length);
    let sum = 0;
    for (let i = start; i < end; i++) sum += (samples[i] ?? 0) ** 2;
    if (Math.sqrt(sum / (end - start)) >= VOICED_RMS) voicedFrames++;
  }
  return (voicedFrames * FRAME_SIZE) / SAMPLE_RATE;
}

/**
 * Re-encodes a MediaRecorder blob (webm/ogg/mp4, depending on the browser) as
 * 16 kHz mono 16-bit WAV, the format every speech model accepts.
 * Returns the WAV as base64, its duration, and how many seconds are voiced
 * (above the silence threshold) so silent clips can be skipped.
 */
export async function encodeWavBase64(
  blob: Blob,
): Promise<{ base64: string; duration: number; voiced: number }> {
  const context = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await context.decodeAudioData(await blob.arrayBuffer());
  } finally {
    void context.close();
  }

  const offline = new OfflineAudioContext(
    1,
    Math.max(1, Math.ceil(decoded.duration * SAMPLE_RATE)),
    SAMPLE_RATE,
  );
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const samples = (await offline.startRendering()).getChannelData(0);

  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(
      44 + i * 2,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([view.buffer], { type: "audio/wav" }));
  });

  return {
    base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
    duration: decoded.duration,
    voiced: voicedSeconds(samples),
  };
}
