'use client';

import { ChangeEvent, FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { generateLiteratureDeckAction } from '@/actions/admin/generate-literature-deck';

type GenerationResult = {
  moduleId: string;
  moduleTitle: string;
  cardCount: number;
  vectorsSynced: boolean;
};

export default function LiteratureAdminPage() {
  const [examYear, setExamYear] = useState(2026);
  const [bookTitle, setBookTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterText, setChapterText] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type && file.type !== 'text/plain' && !file.name.toLowerCase().endsWith('.txt')) {
      setError('For now, upload a .txt excerpt or paste the chapter text below.');
      return;
    }
    setError('');
    setChapterText(await file.text());
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    setError('');
    setResult(null);

    startTransition(async () => {
      const response = await generateLiteratureDeckAction({
        examYear,
        bookTitle,
        chapterNumber,
        chapterText,
      });
      if (response.success !== true) {
        setError(response.error);
        return;
      }
      setResult({
        moduleId: response.moduleId,
        moduleTitle: response.moduleTitle,
        cardCount: response.cardCount,
        vectorsSynced: response.vectorsSynced,
      });
    });
  };

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-8 text-[#18352b] sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-xs font-black uppercase tracking-[0.16em] text-[#6a8277] hover:text-[#1c9a67]">← Home</Link>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#e2763b]">Admin studio</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Build a literature deck</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6a8277]">
              Give Jamby one chapter excerpt. It will extract the important literary facts and turn them into five JAMB-style practice cards.
            </p>
          </div>
          <span className="rounded-full bg-[#e4f6ea] px-3 py-2 text-xs font-black text-[#126b47]">NVIDIA NIM ready</span>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-6">
          <section className="rounded-[2rem] border border-[#dce8e0] bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
              <div>
                <label htmlFor="book-title" className="text-sm font-black">Prescribed novel title</label>
                <input
                  id="book-title"
                  value={bookTitle}
                  onChange={(event) => setBookTitle(event.target.value)}
                  placeholder="The Lekki Headmaster"
                  maxLength={255}
                  required
                  className="mt-2 min-h-12 w-full rounded-xl border border-[#dce8e0] bg-[#fbfdfb] px-4 text-sm outline-none transition focus:border-[#1c9a67] focus:ring-2 focus:ring-[#b7e3c6]"
                />
              </div>
              <div>
                <label htmlFor="exam-year" className="text-sm font-black">Exam year</label>
                <input
                  id="exam-year"
                  type="number"
                  min={2020}
                  max={2100}
                  value={examYear}
                  onChange={(event) => setExamYear(Number(event.target.value))}
                  required
                  className="mt-2 min-h-12 w-full rounded-xl border border-[#dce8e0] bg-[#fbfdfb] px-4 text-sm outline-none transition focus:border-[#1c9a67] focus:ring-2 focus:ring-[#b7e3c6]"
                />
              </div>
            </div>

            <div className="mt-5 max-w-[180px]">
              <label htmlFor="chapter-number" className="text-sm font-black">Chapter number</label>
              <input
                id="chapter-number"
                type="number"
                min={1}
                value={chapterNumber}
                onChange={(event) => setChapterNumber(Number(event.target.value))}
                required
                className="mt-2 min-h-12 w-full rounded-xl border border-[#dce8e0] bg-[#fbfdfb] px-4 text-sm outline-none transition focus:border-[#1c9a67] focus:ring-2 focus:ring-[#b7e3c6]"
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#dce8e0] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <label htmlFor="chapter-text" className="text-sm font-black">Chapter excerpt</label>
                <p className="mt-1 text-xs text-[#789083]">Paste at least 300 characters, or upload a plain-text excerpt.</p>
              </div>
              <label className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-[#dce8e0] px-4 text-xs font-black text-[#37604d] transition hover:bg-[#f2faf4]">
                Upload .txt
                <input type="file" accept=".txt,text/plain" onChange={handleFileChange} className="sr-only" />
              </label>
            </div>
            <textarea
              id="chapter-text"
              value={chapterText}
              onChange={(event) => setChapterText(event.target.value)}
              required
              rows={14}
              placeholder="Paste the chapter text here..."
              className="mt-4 w-full resize-y rounded-2xl border border-[#dce8e0] bg-[#fbfdfb] p-4 text-sm leading-6 outline-none transition focus:border-[#1c9a67] focus:ring-2 focus:ring-[#b7e3c6]"
            />
            <p className="mt-2 text-right text-xs font-bold text-[#789083]">{chapterText.length.toLocaleString()} / 120,000 characters</p>
          </section>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-5 text-[#789083]">Jamby will use only the supplied excerpt and will not invent unsupported plot details.</p>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#18352b] px-6 text-sm font-black text-white transition hover:bg-[#285443] disabled:cursor-wait disabled:opacity-60"
            >
              {isPending ? 'Jamby is building the deck...' : 'Generate 5-card deck'}
            </button>
          </div>
        </form>

        {error && <p className="mt-5 rounded-2xl bg-[#fff0e9] p-4 text-sm font-bold text-[#9c4228]" role="alert">{error}</p>}
        {result && (
          <section className="mt-5 rounded-2xl bg-[#e4f6ea] p-5 text-sm text-[#126b47]" role="status">
            <p className="font-black">Deck generated successfully.</p>
            <p className="mt-1">{result.moduleTitle} contains {result.cardCount} cards. {result.vectorsSynced ? 'Pinecone vectors are synced.' : 'Database saved; Pinecone was not configured.'}</p>
            <Link href={`/learn/module/${result.moduleId}`} className="mt-3 inline-flex font-black underline underline-offset-4">Open the generated deck →</Link>
          </section>
        )}
      </div>
    </main>
  );
}
