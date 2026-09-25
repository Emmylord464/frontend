'use client';

import { motion } from 'framer-motion';

interface Props {
  activeDays: string[]; // ISO date strings "YYYY-MM-DD"
}

function getLast30Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function StreakCalendar({ activeDays }: Props) {
  const days = getLast30Days();
  const activeSet = new Set(activeDays);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mt-4">
      {/* Day-of-week header */}
      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((l, i) => (
          <div key={i} className="text-center text-[9px] font-black uppercase tracking-wider text-slate-500">
            {l}
          </div>
        ))}
      </div>

      {/* 30-day grid — pad the start to align weekdays */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells for weekday alignment */}
        {Array.from({ length: new Date(days[0]).getDay() }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((day, idx) => {
          const isActive = activeSet.has(day);
          const isToday = day === today;
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.012, type: 'spring', stiffness: 400, damping: 20 }}
              title={day}
              className={`aspect-square rounded-md transition-all
                ${isActive
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'bg-slate-800/60'}
                ${isToday ? 'ring-2 ring-offset-1 ring-cyan-400 ring-offset-slate-900' : ''}`}
            />
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[10px] font-bold text-[#9aaca0]">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-[#edf2ef]" /> No session
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-[#1d8b63]" /> Active day
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-[#edf2ef] ring-2 ring-[#e2763b] ring-offset-0.5" /> Today
        </div>
      </div>
    </div>
  );
}

