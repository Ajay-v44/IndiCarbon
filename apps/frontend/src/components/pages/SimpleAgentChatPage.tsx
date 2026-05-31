"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, LoaderCircle, UserRound } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearAIError,
  fetchChatHistory,
  sendChatMessageThunk,
} from "@/store/ai-slice";
import type { ChatHistoryItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

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

function ChatTurn({ item }: { item: ChatHistoryItem }) {
  return (
    <article className="space-y-4">
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-[1.5rem] rounded-br-md bg-[#14532d] px-4 py-3 text-base font-medium leading-7 text-white shadow-[0_14px_36px_rgba(20,83,45,0.18)] sm:max-w-[78%]">
          <div className="mb-2 flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            You
            <UserRound className="h-3.5 w-3.5" />
          </div>
          <p className="whitespace-pre-wrap">{item.query}</p>
        </div>
      </div>

      <div className="flex justify-start">
        <div className="max-w-[92%] rounded-[1.5rem] rounded-bl-md border border-[#cdebd7] bg-white px-4 py-3 text-base leading-7 text-[#102016] shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:max-w-[82%]">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#166534]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dcfce7] text-[#14532d]">
              <Bot className="h-4 w-4" />
            </span>
            IndiCarbon AI
          </div>
          <p className="whitespace-pre-wrap">{item.answer}</p>
          <p className="mt-3 text-xs font-medium text-[#5f7167]">
            {formatTimestamp(item.created_at)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function SimpleAgentChatPage() {
  const dispatch = useAppDispatch();
  const { chatHistory, status, error } = useAppSelector((state) => state.ai);
  const [query, setQuery] = useState("");
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const isSending = status === "loading";

  useEffect(() => {
    dispatch(fetchChatHistory({ limit: 24 }))
      .unwrap()
      .catch(() => {
        // The slice already stores the user-facing error; keep the page mounted.
      })
      .finally(() => setHasLoadedHistory(true));
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;

    const timer = window.setTimeout(() => {
      dispatch(clearAIError());
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [dispatch, error]);

  useEffect(() => {
    streamRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory.length, pendingQuery]);

  async function submitMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setPendingQuery(trimmed);
    setQuery("");

    try {
      await dispatch(sendChatMessageThunk(trimmed)).unwrap();
    } catch {
      // The slice renders the error inline below the conversation.
    } finally {
      setPendingQuery(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(query);
  }

  return (
    <section className="relative isolate flex min-h-[calc(100vh-8rem)] overflow-hidden rounded-[2rem] border border-[#c9e7d0] bg-[#f7fbf3] text-[#102016] shadow-[0_24px_80px_rgba(20,83,45,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,197,94,0.18),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(20,184,166,0.14),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.88),rgba(236,253,245,0.68))]" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#bbf7d0]/60 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-8 h-40 w-40 rounded-full border border-[#95d5a2]/40" />

      <div className="relative flex min-h-0 w-full flex-col p-3 sm:p-5">
        <header className="rounded-[1.7rem] border border-[#c9e7d0] bg-white/90 px-5 py-4 shadow-sm backdrop-blur md:px-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#15803d]">
            IndiCarbon chat
          </p>
          <h1 className="mt-1 font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-[#102016] sm:text-3xl">
            Ask clearly. Read comfortably.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#405247] sm:text-base">
            A simple organization-scoped assistant for carbon accounting, evidence,
            emissions, and sustainability planning.
          </p>
        </header>

        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.7rem] border border-[#c9e7d0] bg-[#eef8ec]/88 shadow-inner backdrop-blur">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
              {!hasLoadedHistory && chatHistory.length === 0 ? (
                <div className="grid min-h-[320px] place-items-center text-center">
                  <div className="rounded-full border border-[#c9e7d0] bg-white px-5 py-3 text-sm font-semibold text-[#14532d] shadow-sm">
                    <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />
                    Loading chat history
                  </div>
                </div>
              ) : null}

              {hasLoadedHistory && chatHistory.length === 0 && !pendingQuery ? (
                <div className="grid min-h-[320px] place-items-center text-center">
                  <div className="max-w-lg rounded-[1.7rem] border border-dashed border-[#a9d8b2] bg-white/92 px-6 py-8 shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#14532d]">
                      <Bot className="h-7 w-7" />
                    </div>
                    <h2 className="mt-4 font-['Space_Grotesk'] text-2xl font-bold text-[#102016]">
                      Start a conversation
                    </h2>
                    <p className="mt-2 text-base leading-7 text-[#4b5f52]">
                      Type your question below and send it. No extra inputs, no
                      clutter.
                    </p>
                  </div>
                </div>
              ) : null}

              {chatHistory.map((item) => (
                <ChatTurn key={item.interaction_id} item={item} />
              ))}

              {pendingQuery ? (
                <article className="space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-[1.5rem] rounded-br-md bg-[#14532d] px-4 py-3 text-base font-medium leading-7 text-white shadow-[0_14px_36px_rgba(20,83,45,0.18)] sm:max-w-[78%]">
                      <div className="mb-2 flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                        You
                        <UserRound className="h-3.5 w-3.5" />
                      </div>
                      <p className="whitespace-pre-wrap">{pendingQuery}</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="rounded-[1.5rem] rounded-bl-md border border-[#cdebd7] bg-white px-4 py-3 text-base font-medium text-[#14532d] shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                      <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />
                      Thinking through your IndiCarbon context
                    </div>
                  </div>
                </article>
              ) : null}

              <div ref={streamRef} />
            </div>
          </div>

          <div className="border-t border-[#c9e7d0] bg-white/92 px-3 py-3 sm:px-5 sm:py-4">
            {error ? (
              <div className="mx-auto mb-3 max-w-4xl rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-semibold text-[#991b1b]">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
              <div className="flex items-end gap-2 rounded-[1.4rem] border-2 border-[#14532d] bg-white p-2 shadow-[0_12px_32px_rgba(20,83,45,0.14)] focus-within:ring-4 focus-within:ring-[#bbf7d0] sm:gap-3">
                <textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submitMessage(query);
                    }
                  }}
                  placeholder="Type your message..."
                  className="min-h-[54px] flex-1 resize-none bg-transparent px-3 py-3 text-base leading-7 text-[#102016] outline-none placeholder:text-[#6b7d70] sm:min-h-[60px]"
                  rows={1}
                  maxLength={4000}
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  disabled={isSending || query.trim().length === 0}
                  className={cn(
                    "flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl px-4 text-sm font-bold transition sm:h-14 sm:min-w-24",
                    isSending || query.trim().length === 0
                      ? "cursor-not-allowed bg-[#d8e8dc] text-[#728275]"
                      : "bg-[#14532d] text-white shadow-[0_12px_24px_rgba(20,83,45,0.25)] hover:bg-[#166534] focus:outline-none focus:ring-4 focus:ring-[#86efac]"
                  )}
                  aria-label="Send message"
                >
                  {isSending ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Send</span>
                      <ArrowUp className="h-5 w-5 sm:ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
