"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { askSocraticTutorAction } from "@/actions/ask-tutor";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type SharedHint = {
  id: string;
  answer: string;
  requestedBy: string;
};

type CoLearningModeProps = {
  roomCode: string;
  studentId: string;
  subject: string;
  topic: string;
  question: string;
};

export function CoLearningMode({
  roomCode,
  studentId,
  subject,
  topic,
  question,
}: CoLearningModeProps) {
  const [hint, setHint] = useState<SharedHint | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase.channel(`battle:${roomCode}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "co-learning-hint" }, ({ payload }) => {
        setHint(payload as SharedHint);
      })
      .subscribe();

    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [roomCode]);

  const askTogether = () => {
    if (isPending) return;

    setError("");
    startTransition(async () => {
      const result = await askSocraticTutorAction(question, subject, topic);

      if (!result.success || !result.answer) {
        setError(result.error ?? "The shared tutor could not answer.");
        return;
      }

      const sharedHint: SharedHint = {
        id: crypto.randomUUID(),
        answer: result.answer,
        requestedBy: studentId,
      };
      setHint(sharedHint);

      const channel = channelRef.current;
      if (!channel) {
        setError("The shared room connection is not ready yet.");
        return;
      }

      await channel.send({
        type: "broadcast",
        event: "co-learning-hint",
        payload: sharedHint,
      });
    });
  };

  return (
    <section className="rounded-2xl border border-[#b9d8c1] bg-[#eff8f0] p-4 text-[#18352b]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2f7653]">
            Co-learning mode
          </p>
          <h2 className="mt-1 text-lg font-black">Stuck together?</h2>
          <p className="mt-1 text-sm leading-6 text-[#567063]">
            Ask the Socratic tutor and the same guided hint will appear for both players.
          </p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#567063]">
          Room {roomCode}
        </span>
      </div>

      <button
        type="button"
        onClick={askTogether}
        disabled={isPending}
        className="mt-4 rounded-xl bg-[#2f7653] px-4 py-3 text-sm font-black text-white transition hover:bg-[#245d41] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Asking tutor..." : "Ask Socratic AI Together"}
      </button>

      {hint && (
        <div className="mt-4 rounded-xl border border-[#cfe3d3] bg-white p-4 text-sm leading-6">
          <p className="mb-1 text-xs font-black uppercase tracking-[0.12em] text-[#2f7653]">
            Shared hint
          </p>
          <p className="whitespace-pre-wrap">{hint.answer}</p>
        </div>
      )}
      {error && <p className="mt-3 text-sm font-semibold text-[#b34a28]">{error}</p>}
    </section>
  );
}
