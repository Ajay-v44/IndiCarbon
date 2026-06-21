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
      <div className="mt-6 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          "What are my Scope 2 emissions?",
          "Explain BRSR requirements",
          "Suggest reduction strategies",
          "Summarize my compliance status",
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
