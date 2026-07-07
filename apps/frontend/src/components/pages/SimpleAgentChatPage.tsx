"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Copy,
  Check,
  LoaderCircle,
  Sparkles,
  MessageSquareText,
  ChevronDown,
  SquarePen,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearAIError,
  clearChatHistory,
  fetchChatHistory,
  sendChatMessageThunk,
} from "@/store/ai-slice";
import type { ChatHistoryItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

class PCMPlayer {
  private sampleRate: number;
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private analyser: AnalyserNode | null = null;

  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate,
      });
      this.nextStartTime = this.audioCtx.currentTime;
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
    }
  }

  getAnalyser() {
    this.init();
    return this.analyser;
  }

  playChunk(arrayBuffer: ArrayBuffer) {
    this.init();
    if (!this.audioCtx || !this.analyser) return;
    
    if (this.audioCtx.state === "suspended") {
      void this.audioCtx.resume();
    }

    const view = new DataView(arrayBuffer);
    const numSamples = Math.floor(arrayBuffer.byteLength / 2);
    const float32Array = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      float32Array[i] = view.getInt16(i * 2, true) / 32768.0;
    }

    const audioBuffer = this.audioCtx.createBuffer(1, float32Array.length, this.sampleRate);
    audioBuffer.copyToChannel(float32Array, 0);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    
    source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    const currentTime = this.audioCtx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  stop() {
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
      this.nextStartTime = 0;
      this.analyser = null;
    }
  }
  
  getAudioContext() {
    return this.audioCtx;
  }
}


function formatTimestamp(value?: string) {
  if (!value) return "just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground"
      aria-label="Copy response"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="rounded-2xl rounded-br-sm bg-emerald-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    </div>
  );
}

function AgentMessage({
  text,
  timestamp,
  isStreaming,
}: {
  text: string;
  timestamp?: string;
  isStreaming?: boolean;
}) {
  return (
    <div className="flex gap-2.5 sm:gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="group min-w-0 max-w-[88%] sm:max-w-[80%]">
        <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground shadow-sm">
          {isStreaming ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
              </div>
              <span className="text-xs">Thinking...</span>
            </div>
          ) : (
            <div className="prose prose-sm prose-emerald dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isStreaming && (
          <div className="mt-1 flex items-center gap-2 px-1">
            <span className="text-[11px] text-muted-foreground">
              {formatTimestamp(timestamp)}
            </span>
            <CopyButton text={text} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChatTurn({ item }: { item: ChatHistoryItem }) {
  return (
    <div className="space-y-3">
      <UserMessage text={item.query} />
      <AgentMessage text={item.answer} timestamp={item.created_at} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
        <Bot className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="mt-5 text-center text-xl font-semibold text-foreground sm:text-2xl">
        IndiCarbon AI Agent
      </h2>
      <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
        Ask about carbon emissions, BRSR compliance, sustainability strategy, or
        analyze uploaded documents.
      </p>
      <div className="mt-6 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          "Analyze my top emission contributors across Scope 1, 2, and 3",
          "What carbon credits am I eligible for under VERRA or BEE/CCTS?",
          "Give me a complete decarbonization roadmap for 2030 net zero",
          "Explain my Net Carbon Position and what it means",
          "What projects should I submit for carbon credit verification?",
          "Generate a full 15-section sustainability intelligence report",
          "Summarize my BRSR compliance status and gaps",
          "How do I retire credits and improve my offset coverage?",
        ].map((suggestion) => (
          <button
            key={suggestion}
            className="rounded-xl border border-border bg-card px-3 py-2.5 text-left text-xs leading-snug text-muted-foreground transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-foreground dark:hover:bg-emerald-950/20"
            data-suggestion={suggestion}
          >
            {suggestion}
          </button>
        ))}
      </div>

    </div>
  );
}

function ScrollDownButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-md transition hover:bg-muted sm:bottom-28"
    >
      <ChevronDown className="h-3.5 w-3.5" />
      New messages
    </button>
  );
}

const LANGUAGES_LIST = [
  { code: "unknown", name: "Auto Detect Language" },
  { code: "en-IN", name: "English (India)" },
  { code: "hi-IN", name: "Hindi (हिन्दी)" },
  { code: "ta-IN", name: "Tamil (தமிழ்)" },
  { code: "te-IN", name: "Telugu (తెలుగు)" },
  { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ml-IN", name: "Malayalam (മലയാളം)" },
  { code: "mr-IN", name: "Marathi (मराठी)" },
  { code: "gu-IN", name: "Gujarati (ગુજરાતી)" },
  { code: "bn-IN", name: "Bengali (বাংলা)" },
  { code: "pa-IN", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "od-IN", name: "Odia (ଓଡ଼ିଆ)" },
];

export function SimpleAgentChatPage() {
  const dispatch = useAppDispatch();
  const { chatHistory, status, error } = useAppSelector((state) => state.ai);
  const [query, setQuery] = useState("");
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isSending = status === "loading";

  // ─── Voice Mode State & Refs ──────────────────────────────────────────────────
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"connecting" | "listening" | "thinking" | "speaking" | "error" | "disconnected">("disconnected");
  const [transcriptText, setTranscriptText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [speakerLevel, setSpeakerLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("unknown");

  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const pcmPlayerRef = useRef<PCMPlayer | null>(null);
  const speakerAnalyserRef = useRef<AnalyserNode | null>(null);

  const voiceStatusRef = useRef(voiceStatus);
  useEffect(() => {
    voiceStatusRef.current = voiceStatus;
  }, [voiceStatus]);

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const handleOrbClick = () => {
    if (voiceStatus === "speaking" || voiceStatus === "thinking") {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "interrupt" }));
      }
      if (pcmPlayerRef.current) {
        pcmPlayerRef.current.stop();
      }
      setVoiceStatus("listening");
      setTranscriptText("");
      setResponseText("");
    }
  };

  // Poll microphone volume for the visualizer
  const pollMicVolume = () => {
    if (!analyserRef.current) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVolume = () => {
      if (!analyserRef.current || !micStreamRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const level = Math.min(100, Math.floor((average / 255) * 100 * 2));
      setMicLevel(level);
      
      if (micStreamRef.current) {
        requestAnimationFrame(updateVolume);
      }
    };
    
    requestAnimationFrame(updateVolume);
  };

  // Poll speaker volume for the visualizer
  const pollSpeakerVolume = () => {
    if (!speakerAnalyserRef.current) return;
    const bufferLength = speakerAnalyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVolume = () => {
      if (!speakerAnalyserRef.current || !pcmPlayerRef.current?.getAudioContext()) return;
      speakerAnalyserRef.current.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const level = Math.min(100, Math.floor((average / 255) * 100 * 2.5));
      setSpeakerLevel(level);
      
      if (pcmPlayerRef.current?.getAudioContext()) {
        requestAnimationFrame(updateVolume);
      }
    };
    
    requestAnimationFrame(updateVolume);
  };

  // Cleanup helper
  const cleanupAudio = () => {
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch(e){}
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e){}
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      try { micStreamRef.current.getTracks().forEach(track => track.stop()); } catch(e){}
      micStreamRef.current = null;
    }
    if (pcmPlayerRef.current) {
      try { pcmPlayerRef.current.stop(); } catch(e){}
    }
    if (wsRef.current) {
      try { wsRef.current.close(); } catch(e){}
      wsRef.current = null;
    }
    analyserRef.current = null;
    speakerAnalyserRef.current = null;
    setMicLevel(0);
    setSpeakerLevel(0);
  };

  // Helper to convert base64 to arraybuffer
  const base64ToArrayBuffer = (base64Str: string) => {
    const binaryString = window.atob(base64Str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Start voice mode
  const startVoiceMode = async () => {
    await startVoiceModeWithLang(selectedLanguage);
  };

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      setVoiceStatus("connecting");
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (pcmPlayerRef.current) {
        pcmPlayerRef.current.stop();
      }
      
      try {
        wsRef.current.close();
      } catch (e) {}
      
      setTimeout(() => {
        void startVoiceModeWithLang(newLang);
      }, 300);
    }
  };

  const startVoiceModeWithLang = async (langCode: string) => {
    setIsVoiceModeActive(true);
    setVoiceStatus("connecting");
    setTranscriptText("");
    setResponseText("");

    // Initialize PCM Player immediately in click handler so the AudioContext starts running!
    const pcmPlayer = new PCMPlayer(24000);
    pcmPlayer.init();
    pcmPlayerRef.current = pcmPlayer;

    // 1. Get tokens and build url
    const stored = localStorage.getItem("indicarbon_tokens");
    let token = "";
    if (stored) {
      try {
        const tokens = JSON.parse(stored);
        token = tokens.access_token || "";
      } catch (e) {
        console.error(e);
      }
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const wsBase = apiBase.replace("http://", "ws://").replace("https://", "wss://");
    const wsUrl = `${wsBase}/api/v1/ai/voice?token=${token}&lang=${langCode}`;

    try {
      // 2. Connect websocket
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setVoiceStatus("listening");
        // Start recording
        void startRecording();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === "status") {
            const statusVal = msg.value;
            setVoiceStatus(statusVal);
            if (statusVal === "listening") {
              setTranscriptText("");
              setResponseText("");
            }
          } else if (msg.type === "transcript") {
            setTranscriptText(msg.value);
            if (msg.is_final) {
              setResponseText("");
            }
          } else if (msg.type === "response") {
            setResponseText(msg.value);
            // Append voice queries to standard chat list so history updates in real-time!
            dispatch(fetchChatHistory({ limit: 50 }));
          } else if (msg.type === "audio") {
            if (pcmPlayerRef.current) {
              // Parse base64 audio and play it
              const audioBuffer = base64ToArrayBuffer(msg.value);
              pcmPlayerRef.current.playChunk(audioBuffer);
            }
          } else if (msg.type === "error") {
            console.error("Voice server error:", msg.value);
            setVoiceStatus("error");
          }
        } catch (e) {
          console.error("Error parsing websocket message", e);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setVoiceStatus("error");
      };

      ws.onclose = () => {
        setVoiceStatus("disconnected");
        cleanupAudio();
      };

    } catch (err) {
      console.error("Failed to start Voice Mode:", err);
      setVoiceStatus("error");
    }
  };

  // Start microphone capture
  const startRecording = async () => {
    const downsampleBuffer = (buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) => {
      if (inputSampleRate === outputSampleRate) {
        return buffer;
      }
      const sampleRateRatio = inputSampleRate / outputSampleRate;
      const newLength = Math.round(buffer.length / sampleRateRatio);
      const result = new Float32Array(newLength);
      let offsetResult = 0;
      let offsetBuffer = 0;
      while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0;
        let count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
        }
        result[offsetResult] = count > 0 ? accum / count : 0;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
      return result;
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1.5; // Amplify mic input by 1.5x for better STT accuracy!
      source.connect(gainNode);
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      gainNode.connect(analyser);
      analyserRef.current = analyser;

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      gainNode.connect(processor);
      processor.connect(audioCtx.destination);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        if (isMutedRef.current) return;
        if (voiceStatusRef.current !== "listening") return;

        const inputData = e.inputBuffer.getChannelData(0);
        const currentSampleRate = audioCtx.sampleRate;
        const downsampledData = downsampleBuffer(inputData, currentSampleRate, 16000);
        
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(downsampledData.length);
        for (let i = 0; i < downsampledData.length; i++) {
          const s = Math.max(-1, Math.min(1, downsampledData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        wsRef.current.send(pcmData.buffer);
      };

      // Set up speaker analyser
      if (pcmPlayerRef.current) {
        const speakerAnalyser = pcmPlayerRef.current.getAnalyser();
        if (speakerAnalyser) {
          speakerAnalyserRef.current = speakerAnalyser;
          pollSpeakerVolume();
        }
      }

      pollMicVolume();

    } catch (err) {
      console.error("Failed to access microphone:", err);
      setVoiceStatus("error");
    }
  };

  // Exit voice mode
  const exitVoiceMode = () => {
    setIsVoiceModeActive(false);
    cleanupAudio();
  };

  // Auto clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  useEffect(() => {
    dispatch(fetchChatHistory({ limit: 50 }))
      .unwrap()
      .catch(() => {})
      .finally(() => setHasLoadedHistory(true));
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => dispatch(clearAIError()), 7000);
    return () => window.clearTimeout(timer);
  }, [dispatch, error]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory.length, pendingQuery]);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    function handleScroll() {
      if (!el) return;
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollDown(distFromBottom > 200);
    }

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function autoResize() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }

  async function submitMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setPendingQuery(trimmed);
    setQuery("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await dispatch(sendChatMessageThunk(trimmed)).unwrap();
    } catch {
      // slice handles error
    } finally {
      setPendingQuery(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(query);
  }

  function handleSuggestionClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLButtonElement>("[data-suggestion]");
    if (btn?.dataset.suggestion) {
      void submitMessage(btn.dataset.suggestion);
    }
  }

  const hasMessages = chatHistory.length > 0 || !!pendingQuery;

  if (isVoiceModeActive) {
    const isListening = voiceStatus === "listening";
    const isThinking = voiceStatus === "thinking";
    const isSpeaking = voiceStatus === "speaking";

    const currentLevel = isListening ? micLevel : (isSpeaking ? speakerLevel : 10);
    const orbScale = 1 + currentLevel / 150;
    const orbGlow = currentLevel * 0.8;

    return (
      <div 
        style={{
          background: "radial-gradient(circle at center, rgba(6, 78, 59, 0.4) 0%, rgba(2, 6, 23, 0.98) 80%)"
        }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center text-foreground p-4 sm:p-6 md:p-8"
      >
        <div 
          className={cn(
            "absolute inset-0 -z-10 bg-radial-gradient from-emerald-500/5 via-transparent to-transparent opacity-50 transition-all duration-1000 blur-3xl",
            isListening && "from-emerald-500/10",
            isThinking && "from-cyan-500/10 animate-pulse",
            isSpeaking && "from-emerald-500/15"
          )}
        />

        <div className="relative flex h-full w-full max-w-2xl flex-col items-center justify-between rounded-3xl border border-white/10 bg-card/30 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          
          <div className="flex w-full items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-white">IndiCarbon Live AI</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Powered by Sarvam AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-[11px] font-semibold text-white outline-none cursor-pointer transition hover:bg-slate-800/80 focus:border-emerald-500/50"
              >
                {LANGUAGES_LIST.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-950 text-white">
                    {lang.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <span className={cn(
                  "h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
                  isThinking && "bg-cyan-400 animate-pulse",
                  isListening && "animate-ping"
                )} />
                <span className="capitalize">{voiceStatus}</span>
              </div>
            </div>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center py-6">
            {isListening && (
              <>
                <div className="absolute h-48 w-48 animate-ping rounded-full border border-emerald-500/20 [animation-duration:3s]" />
                <div className="absolute h-56 w-56 animate-ping rounded-full border border-emerald-500/10 [animation-duration:2s]" />
              </>
            )}

            {isThinking && (
              <div className="absolute h-44 w-44 animate-spin rounded-full border-2 border-dashed border-cyan-500/30 [animation-duration:6s]" />
            )}

            <div 
              onClick={handleOrbClick}
              style={{
                transform: `scale(${orbScale})`,
                boxShadow: `0 0 ${40 + orbGlow}px rgba(${isThinking ? "6,182,212" : "16,185,129"}, ${0.4 + currentLevel/100})`,
                transition: "transform 0.05s ease-out, box-shadow 0.05s ease-out"
              }}
              className={cn(
                "flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-2xl transition-colors duration-1000",
                isThinking && "from-cyan-400 to-cyan-600",
                (isSpeaking || isThinking) && "cursor-pointer hover:scale-105 active:scale-95"
              )}
              title={(isSpeaking || isThinking) ? "Click to interrupt agent" : undefined}
            >
              <div className="h-32 w-32 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center">
                {isListening && <Mic className="h-10 w-10 text-white animate-pulse" />}
                {isThinking && <LoaderCircle className="h-10 w-10 text-white animate-spin" />}
                {isSpeaking && <Volume2 className="h-10 w-10 text-white animate-bounce" />}
              </div>
            </div>
            {(isSpeaking || isThinking) && (
              <span className="absolute bottom-[-24px] text-[10px] text-muted-foreground animate-pulse">
                Click orb to interrupt
              </span>
            )}
          </div>

          <div className="my-6 flex w-full flex-1 flex-col justify-center space-y-4 text-center max-w-md overflow-hidden">
            {transcriptText && (
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest">You said</p>
                <p className="text-sm font-medium text-white/90 line-clamp-3">"{transcriptText}"</p>
              </div>
            )}

            {responseText && (
              <div className="space-y-1 border-t border-white/5 pt-4">
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Agent responded</p>
                <p className="text-base text-emerald-300 font-semibold leading-relaxed line-clamp-4">
                  {responseText}
                </p>
              </div>
            )}
            
            {!transcriptText && !responseText && (
              <p className="text-sm text-muted-foreground animate-pulse">
                {isListening ? "Say something like 'Calculate diesel Scope 1 emissions'" : "Awaiting agent response..."}
              </p>
            )}
          </div>

          <div className="flex w-full items-center justify-center gap-6 border-t border-white/5 pt-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-95",
                isMuted && "border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20"
              )}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              onClick={exitVoiceMode}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700 active:scale-95 shadow-red-900/30"
              title="Exit Live Mode"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-xl border border-border bg-background sm:h-[calc(100vh-6rem)] lg:h-[calc(100vh-7rem)]">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur sm:px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
          <MessageSquareText className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-foreground">
            Agenti Chat
          </h1>
          <p className="text-[11px] text-muted-foreground">
            AI-powered carbon intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasMessages && (
            <button
              onClick={() => dispatch(clearChatHistory())}
              className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="New conversation"
            >
              <SquarePen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
          <button
            onClick={startVoiceMode}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20 active:scale-95 mr-2"
            aria-label="Start Voice Mode"
          >
            <Mic className="h-3.5 w-3.5 animate-pulse" />
            <span>Voice Mode</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
            <span className="text-[11px] font-medium text-emerald-600">Live</span>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div
        ref={scrollAreaRef}
        className="relative flex-1 overflow-y-auto"
        onClick={handleSuggestionClick}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-3 py-4 sm:px-4 sm:py-6">
          {!hasLoadedHistory && chatHistory.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-20">
              <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {hasLoadedHistory && !hasMessages && <EmptyState />}

          {chatHistory.map((item) => (
            <ChatTurn key={item.interaction_id} item={item} />
          ))}

          {pendingQuery && (
            <div className="space-y-3">
              <UserMessage text={pendingQuery} />
              <AgentMessage text="" isStreaming />
            </div>
          )}

          <div ref={bottomRef} className="h-1" />
        </div>

        {showScrollDown && <ScrollDownButton onClick={scrollToBottom} />}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border bg-card/80 px-3 pb-3 pt-2 backdrop-blur sm:px-4 sm:pb-4 sm:pt-3">
        {error && (
          <div className="mx-auto mb-2 max-w-3xl rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-1.5 shadow-sm transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                autoResize();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submitMessage(query);
                }
              }}
              placeholder="Ask about emissions, compliance, strategy..."
              className="min-h-[40px] max-h-[160px] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground sm:min-h-[44px]"
              rows={1}
              maxLength={4000}
              aria-label="Chat message"
            />
            <button
              type="submit"
              disabled={isSending || query.trim().length === 0}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition sm:h-10 sm:w-10",
                isSending || query.trim().length === 0
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-95"
              )}
              aria-label="Send message"
            >
              {isSending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground sm:text-[11px]">
            AI responses are generated — verify critical data independently
          </p>
        </form>
      </div>
    </div>
  );
}
