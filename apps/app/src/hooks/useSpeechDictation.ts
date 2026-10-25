"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { encodeWavBase64 } from "@/lib/audio/wav";
import { transcribeCommentAudio } from "@/lib/comment/service";

/** Keeps uploads under the API's body cap (~2.6 MB of base64 WAV). */
export const MAX_RECORDING_SECONDS = 60;
/** Clips with less voiced audio than this are treated as silence. */
const MIN_VOICED_SECONDS = 0.25;

export type DictationState =
  "idle" | "starting" | "recording" | "transcribing" | "failed";

const isSupported = () =>
  typeof navigator !== "undefined" &&
  Boolean(navigator.mediaDevices?.getUserMedia) &&
  typeof MediaRecorder !== "undefined" &&
  typeof AudioContext !== "undefined";

function errorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError")
      return "Microphone access is blocked. Allow it in your browser settings to use voice typing.";
    if (error.name === "NotFoundError") return "No microphone was found.";
  }
  if (error instanceof Error && /unauthori[sz]ed|401/i.test(error.message))
    return "Sign in to use voice typing.";
  if (error instanceof Error && /too many/i.test(error.message))
    return "Too many voice requests. Try again in a moment.";
  return "Couldn't transcribe that.";
}

/**
 * Voice typing: records the microphone, then transcribes the clip through the
 * API (OpenRouter). `onTranscript` receives the text once the recording ends.
 * While recording, `elapsed` counts seconds and `analyser` exposes live input
 * levels for a waveform. A failed transcription keeps the clip for `retry`.
 */
export function useSpeechDictation(
  postId: string,
  onTranscript: (transcript: string) => void,
) {
  const [state, setState] = useState<DictationState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const clipRef = useRef<Blob | null>(null);
  // Bumped by cancel/start so late results from an abandoned run are ignored.
  const runRef = useRef(0);
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  const transcribe = useCallback(
    async (clip: Blob) => {
      const run = runRef.current;
      const fail = (message: string) => {
        if (run !== runRef.current) return;
        setFailure(message);
        setState("failed");
      };
      // Nothing worth retrying: drop the clip and go back to the composer.
      const noSpeech = () => {
        if (run !== runRef.current) return;
        clipRef.current = null;
        setState("idle");
        toast.error("No speech detected");
      };
      clipRef.current = clip;
      setFailure(null);
      setState("transcribing");
      try {
        const { base64, duration, voiced } = await encodeWavBase64(clip);
        if (duration < 0.3 || voiced < MIN_VOICED_SECONDS) return noSpeech();
        const text = await transcribeCommentAudio(postId, base64);
        if (run !== runRef.current) return;
        if (!text) return noSpeech();
        clipRef.current = null;
        setState("idle");
        onTranscriptRef.current(text);
      } catch (error) {
        fail(errorMessage(error));
      }
    },
    [postId],
  );

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    if (!isSupported()) {
      toast.error("Voice typing isn't supported in this browser.");
      return;
    }
    const run = ++runRef.current;
    clipRef.current = null;
    setFailure(null);
    setElapsed(0);
    // Show the recording UI immediately; the mic can take a moment to open.
    setState("starting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      if (run !== runRef.current) return;
      setState("idle");
      toast.error(errorMessage(error));
      return;
    }
    if (run !== runRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    const audioContext = new AudioContext();
    const levels = audioContext.createAnalyser();
    levels.fftSize = 512;
    audioContext.createMediaStreamSource(stream).connect(levels);

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    const startedAt = Date.now();
    const ticker = setInterval(() => {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(seconds);
      if (seconds >= MAX_RECORDING_SECONDS && recorder.state === "recording")
        recorder.stop();
    }, 250);

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = () => {
      clearInterval(ticker);
      stream.getTracks().forEach((track) => track.stop());
      void audioContext.close();
      recorderRef.current = null;
      if (run !== runRef.current) return;
      setAnalyser(null);
      if (!chunks.length) return setState("idle");
      void transcribe(new Blob(chunks, { type: recorder.mimeType }));
    };

    recorderRef.current = recorder;
    recorder.start();
    setAnalyser(levels);
    setState("recording");
  }, [transcribe]);

  /** Ends the recording and transcribes it. */
  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  /** Drops the recording, pending transcription, or failed clip. */
  const cancel = useCallback(() => {
    runRef.current++;
    clipRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setAnalyser(null);
    setFailure(null);
    setState("idle");
  }, []);

  /** Re-sends the kept clip after a failed transcription. */
  const retry = useCallback(() => {
    if (clipRef.current) void transcribe(clipRef.current);
  }, [transcribe]);

  useEffect(
    () => () => {
      runRef.current++;
      if (recorderRef.current?.state === "recording")
        recorderRef.current.stop();
    },
    [],
  );

  return { state, elapsed, analyser, failure, start, stop, cancel, retry };
}
