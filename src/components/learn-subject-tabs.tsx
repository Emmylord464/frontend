'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export interface SubjectStat {
  key: string;
  name: string;
  short: string;
  color: string;
  accent: string;
  topicCount: number;
  qCount: number;
}

interface Props {
  subjects: SubjectStat[];
  activeSubjectKey: string;
}

export function LearnSubjectTabs({ subjects, activeSubjectKey }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function selectSubject(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('subject', key);
    router.push(`/learn?${params.toString()}`);
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4a6d63]">Subject lanes</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.05em]">Choose your subject</h2>
        </div>
        <span className="text-sm font-bold text-[#5e776f]">4 subjects</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {subjects.map((subject) => {
          const isActive = subject.key === activeSubjectKey;
          return (
            <motion.article
              key={subject.key}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => selectSubject(subject.key)}
              className={`cursor-pointer rounded-[1.75rem] border p-4 shadow-[0_12px_25px_rgba(15,23,42,0.04)] transition-all
                ${isActive
                  ? 'border-[#1b2d28] bg-[#1b2d28] text-white'
                  : 'border-[#e4ddd5] bg-white text-[#1b2d28] hover:border-[#b8c5bf]'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black
                  ${isActive ? 'bg-white/10 text-white' : subject.accent}`}>
                  {subject.short}
                </span>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"
                  >
                    Active
                  </motion.span>
                )}
              </div>

              <h3 className="mt-5 text-xl font-black tracking-[-0.04em]">{subject.name}</h3>

              <div className="mt-3 flex items-center gap-3 text-xs font-bold">
                <span className={isActive ? 'text-white/70' : 'text-[#5e776f]'}>
                  {subject.topicCount} topics
                </span>
                <span className={isActive ? 'text-white/40' : 'text-[#c0ccc6]'}>·</span>
                <span className={isActive ? 'text-white/70' : 'text-[#5e776f]'}>
                  {subject.qCount.toLocaleString()} questions
                </span>
              </div>

              {/* Mini progress bar (placeholder until per-subject progress is tracked) */}
              <div className={`mt-4 h-1.5 overflow-hidden rounded-full ${isActive ? 'bg-white/10' : 'bg-[#edf2ef]'}`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: isActive ? '#f1c387' : subject.color }}
                  initial={{ width: 0 }}
                  animate={{ width: subject.topicCount > 0 ? '15%' : '0%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

