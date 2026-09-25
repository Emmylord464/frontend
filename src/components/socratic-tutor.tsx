"use client";

import { FormEvent, useState, useTransition } from "react";
import { askSocraticTutorAction } from "@/actions/ask-tutor";

type TutorMessage = {
  role: "student" | "tutor";
  content: string;
};

type SocraticTutorProps = {
  subject: string;
  topic: string;
};

export function SocraticTutor({ subject, topic }: SocraticTutorProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedQuestion = question.trim();

    if (!submittedQuestion || isPending) {
      return;
    }

    setError("");
    setQuestion("");
    setMessages((current) => [
      ...current,
      { role: "student", content: submittedQuestion },
    ]);

    startTransition(async () => {
      const result = await askSocraticTutorAction(
        submittedQuestion,
        subject,
        topic,
      );

      if (result.success !== true) {
        setError(result.error ?? "The tutor could not answer that question.");
        return;
      }

      setMessages((current) => [
        ...current,
        { role: "tutor", content: result.answer ?? "No answer was returned." },
      ]);
    });
  };

  return (
    <section className="mt-6 rounded-3xl border border-[#dce8e0] bg-[#18352b] p-5 text-white shadow-[0_16px_50px_rgba(24,53,43,0.12)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f3b28e]">
            Jamby AI tutor
          </p>
          <h2 className="mt-1 text-xl font-black">Think it through</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#d6e5da]">
            Ask about {subject.toLowerCase()} and get a guided hint for {topic.toLowerCase()}.
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#d6e5da]">
          {topic}
        </span>
      </div>

      <div className="mt-5 grid gap-3" aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "student"
                ? "ml-auto bg-[#f3b28e] text-[#3b2115]"
                : "bg-white/10 text-[#f4faf5]"
            }`}
          >
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
              {message.role === "student" ? "You" : "Tutor"}
            </p>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {isPending && (
          <p className="text-sm text-[#d6e5da]" role="status">
            Jamby is thinking...
          </p>
        )}
      </div>

      <form onSubmit={submitQuestion} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="tutor-question" className="sr-only">
          Ask the tutor a question
        </label>
        <input
          id="tutor-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={2000}
          placeholder="Ask about this topic..."
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-white px-4 text-sm text-[#18352b] outline-none placeholder:text-[#789083] focus:ring-2 focus:ring-[#f3b28e]"
        />
        <button
          type="submit"
          disabled={isPending || !question.trim()}
          className="min-h-12 rounded-xl bg-[#f3b28e] px-5 text-sm font-black text-[#3b2115] transition hover:bg-[#f7c2a4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask Jamby for a Hint 💡
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-[#ffd2bd]">{error}</p>}
    </section>
  );
}
