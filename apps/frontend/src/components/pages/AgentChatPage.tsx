"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Clock3,
  Leaf,
  LoaderCircle,
  MessageSquareText,
  Orbit,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearAIError,
  fetchChatHistory,
  sendChatMessageThunk,
} from "@/store/ai-slice";
import type { ChatHistoryItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const suggestedPrompts = [
  "Summarize our latest organization emissions trend in plain English.",
  "What documents support our current carbon accounting position?",
  "List the biggest Scope 2 risks we should review this quarter.",
  "Draft an executive update on decarbonization progress for leadership.",
];

const missionSignals = [
  {
    label: "Org-scoped memory",
    value: "Private",
    detail: "Responses stay aligned to your authenticated organization context.",
    icon: ShieldCheck,
  },
  {
    label: "Knowledge retrieval",
    value: "RAG",
    detail: "Citations surface from uploaded sustainability evidence and prior turns.",
    icon: ScanSearch,
  },
  {
    label: "Decision tempo",
    value: "Fast",
    detail: "Use the assistant for reporting, audit prep, and reduction planning.",
    icon: Orbit,
  },
];

function formatTimestamp(value?: string) {
  if (!value) return "Now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Now";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(date);
}

function SourcePill({ item }: { item: ChatHistoryItem["sources"][number] }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/6 px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-white/90">
          {item.filename || "Organization evidence"}
        </p>
        <span className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200">
          {Math.round(item.similarity * 100)}% match
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/60">{item.excerpt}</p>
    </div>
  );
}

function ChatBubble({ item, isLatest }: { item: ChatHistoryItem; isLatest: boolean }) {
  return (
    <article className="fade-in-up grid gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,15,18,0.94),rgba(5,20,22,0.82))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[1.7rem] rounded-br-md border border-emerald-300/18 bg-[linear-gradient(135deg,rgba(18,117,112,0.85),rgba(26,186,146,0.35))] px-4 py-3 text-sm leading-6 text-white shadow-[0_18px_48px_rgba(13,148,136,0.18)]">
          {item.query}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-[radial-gradient(circle_at_30%_30%,rgba(91,248,255,0.25),rgba(9,32,36,0.95))] shadow-[0_0_35px_rgba(34,211,238,0.24)]">
          <Bot className="h-5 w-5 text-cyan-100" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">Agenti for IndiCarbon</p>
            {isLatest && (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                Latest reply
              </span>
            )}
            {item.guardrail_blocked && (
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-100">
                Guardrail applied
              </span>
            )}
          </div>
          <div className="rounded-[1.7rem] rounded-tl-md border border-white/10 bg-white/4 px-4 py-3 text-sm leading-7 text-white/82 backdrop-blur-sm">
            {item.answer}
          </div>
          {item.sources.length > 0 && (
            <div className="grid gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Evidence trail
              </p>
              {item.sources.map((source, index) => (
                <SourcePill
                  key={`${item.interaction_id}-${source.document_id || source.filename || index}`}
                  item={source}
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{formatTimestamp(item.created_at)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AgentChatPage() {
  const dispatch = useAppDispatch();
  const { chatHistory, status, error } = useAppSelector((state) => state.ai);
  const [query, setQuery] = useState("");
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchChatHistory({ limit: 24 }))
      .unwrap()
      .finally(() => setHasLoadedHistory(true));
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;

    const timer = window.setTimeout(() => {
      dispatch(clearAIError());
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [dispatch, error]);

  useEffect(() => {
    streamRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory.length, pendingQuery]);

  const latestResponse = chatHistory.at(-1);
  const quickStats = useMemo(
    () => [
      { label: "Conversations", value: String(chatHistory.length).padStart(2, "0") },
      { label: "Sources surfaced", value: String(chatHistory.reduce((count, item) => count + item.sources.length, 0)).padStart(2, "0") },
      { label: "Security posture", value: "Scoped" },
    ],
    [chatHistory]
  );

  async function submitMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || status === "loading") return;

    setPendingQuery(trimmed);
    setQuery("");

    try {
      await dispatch(sendChatMessageThunk(trimmed)).unwrap();
    } finally {
      setPendingQuery(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(query);
  }

  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-[#173138] bg-[#041317] text-white shadow-[0_30px_120px_rgba(0,0,0,0.34)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,196,182,0.18),transparent_28%),radial-gradient(circle_at_75%_18%,rgba(82,212,167,0.14),transparent_22%),radial-gradient(circle_at_50%_120%,rgba(10,85,70,0.55),transparent_45%),linear-gradient(180deg,#041317_0%,#071b20_48%,#031115_100%)]" />
      <div className="absolute inset-x-0 top-0 h-52 bg-[linear-gradient(180deg,rgba(62,190,175,0.14),transparent)]" />
      <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative grid min-h-[calc(100vh-11rem)] gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:p-6">
        <aside className="border-b border-white/8 p-6 lg:border-b-0 lg:border-r lg:border-white/8 lg:p-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100">
                  <Leaf className="h-3.5 w-3.5" />
                  Climate Intelligence
                </div>
                <h1 className="max-w-xs text-3xl font-bold tracking-tight text-white">
                  Agenti Command Chat
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
                  A purpose-built IndiCarbon copilot for emissions analysis, evidence review, and fast executive answers.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-cyan-300/25 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.45),rgba(4,19,23,0.2))] shadow-[0_0_40px_rgba(56,189,248,0.25)]">
                <Sparkles className="h-6 w-6 text-cyan-50" />
              </div>
            </div>

            <div className="grid gap-3">
              {quickStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              {missionSignals.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-[1.6rem] border border-white/10 bg-[#071d22]/90 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">{item.value}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/58">{item.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-[1.8rem] border border-cyan-300/14 bg-[linear-gradient(135deg,rgba(19,112,117,0.36),rgba(6,24,28,0.8))] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Suggested launch prompts</p>
                  <p className="text-xs text-white/55">Start from your most common sustainability workflows.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void submitMessage(prompt)}
                    disabled={status === "loading"}
                    className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-left text-sm leading-6 text-white/76 transition hover:border-emerald-300/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col p-4 sm:p-6 lg:p-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.8rem] border border-white/10 bg-white/6 px-5 py-4 backdrop-blur-xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
                Organization-scoped assistant
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Ask about emissions, evidence, risk, and decarbonization strategy
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100">
              <span className="status-dot-green" />
              API live on `/api/v1/chat`
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,24,28,0.76),rgba(4,17,20,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6">
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                {!hasLoadedHistory && chatHistory.length === 0 ? (
                  <div className="flex min-h-[320px] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm text-white/70">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Loading prior chat context
                    </div>
                  </div>
                ) : chatHistory.length === 0 && !pendingQuery ? (
                  <div className="grid min-h-[320px] place-items-center px-6 py-10 text-center">
                    <div className="max-w-xl rounded-[2rem] border border-dashed border-white/12 bg-white/4 px-8 py-10">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.8rem] border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_40px_rgba(56,189,248,0.18)]">
                        <Bot className="h-7 w-7" />
                      </div>
                      <h3 className="mt-5 text-2xl font-semibold text-white">Ask your first sustainability question</h3>
                      <p className="mt-3 text-sm leading-7 text-white/60">
                        This assistant follows the same backend flow already in the codebase: authenticated chat, organization-scoped retrieval, and persisted history.
                      </p>
                    </div>
                  </div>
                ) : null}

                {chatHistory.map((item, index) => (
                  <ChatBubble
                    key={item.interaction_id}
                    item={item}
                    isLatest={index === chatHistory.length - 1}
                  />
                ))}

                {pendingQuery && (
                  <article className="fade-in-up grid gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,15,18,0.94),rgba(5,20,22,0.82))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-[1.7rem] rounded-br-md border border-emerald-300/18 bg-[linear-gradient(135deg,rgba(18,117,112,0.85),rgba(26,186,146,0.35))] px-4 py-3 text-sm leading-6 text-white shadow-[0_18px_48px_rgba(13,148,136,0.18)]">
                        {pendingQuery}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-[radial-gradient(circle_at_30%_30%,rgba(91,248,255,0.25),rgba(9,32,36,0.95))] shadow-[0_0_35px_rgba(34,211,238,0.24)]">
                        <Bot className="h-5 w-5 text-cyan-100" />
                      </div>
                      <div className="rounded-[1.7rem] rounded-tl-md border border-white/10 bg-white/4 px-4 py-4 text-sm text-white/72 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <LoaderCircle className="h-4 w-4 animate-spin text-cyan-100" />
                          <span>Thinking through your organization context and available evidence</span>
                        </div>
                      </div>
                    </div>
                  </article>
                )}

                <div ref={streamRef} />
              </div>
            </div>

            <div className="border-t border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.05))] px-4 py-4 sm:px-6">
              {error && (
                <div className="mx-auto mb-3 max-w-4xl rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              )}

              {latestResponse?.sources?.length ? (
                <div className="mx-auto mb-3 flex max-w-4xl flex-wrap gap-2 text-xs text-white/55">
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
                    {latestResponse.sources.length} sources surfaced in latest answer
                  </span>
                  {latestResponse.sources.slice(0, 2).map((source, index) => (
                    <span
                      key={`${source.document_id || source.filename || index}-summary`}
                      className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5"
                    >
                      {source.filename || "Organization evidence"}
                    </span>
                  ))}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
                <div className="rounded-[1.8rem] border border-white/12 bg-white/7 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void submitMessage(query);
                        }
                      }}
                      placeholder="Ask Agenti about emissions, uploaded evidence, policy exposure, or decarbonization strategy..."
                      className="min-h-[64px] flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35"
                      rows={2}
                      maxLength={4000}
                    />
                    <button
                      type="submit"
                      disabled={status === "loading" || query.trim().length < 2}
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.3rem] border transition",
                        status === "loading" || query.trim().length < 2
                          ? "cursor-not-allowed border-white/10 bg-white/8 text-white/30"
                          : "border-emerald-300/25 bg-[linear-gradient(135deg,#12b886,#0f766e)] text-white shadow-[0_16px_40px_rgba(18,184,134,0.28)] hover:scale-[1.02]"
                      )}
                    >
                      {status === "loading" ? (
                        <LoaderCircle className="h-4.5 w-4.5 animate-spin" />
                      ) : (
                        <ArrowUp className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-white/40">
                  <p>Enter to send, Shift + Enter for a new line.</p>
                  <p>{query.length}/4000</p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
