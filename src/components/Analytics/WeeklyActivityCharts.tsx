import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Target, Award, CheckCircle2 } from 'lucide-react';
import { playTapSound } from '../../utils/audio';
import { CountUp } from '../Motion/CountUp';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

interface WeeklyActivityChartsProps {
  currentScore: number;
  targetScore: number;
  dailyGoal?: number;
}

interface DayData {
  day: string;
  fullDate: string;
  questions: number;
  accuracy: number;
  score: number;
  quotaMet: boolean;
}

const WEEKLY_DATA: DayData[] = [
  { day: 'Fri', fullDate: 'Sep 19', questions: 42, accuracy: 76, score: 268, quotaMet: false },
  { day: 'Sat', fullDate: 'Sep 20', questions: 58, accuracy: 82, score: 274, quotaMet: true },
  { day: 'Sun', fullDate: 'Sep 21', questions: 35, accuracy: 74, score: 276, quotaMet: false },
  { day: 'Mon', fullDate: 'Sep 22', questions: 65, accuracy: 83, score: 282, quotaMet: true },
  { day: 'Tue', fullDate: 'Sep 23', questions: 52, accuracy: 79, score: 287, quotaMet: true },
  { day: 'Wed', fullDate: 'Sep 24', questions: 48, accuracy: 81, score: 290, quotaMet: false },
  { day: 'Today', fullDate: 'Sep 25', questions: 54, accuracy: 82, score: 294, quotaMet: true },
];

export const WeeklyActivityCharts: React.FC<WeeklyActivityChartsProps> = ({
  currentScore,
  targetScore,
  dailyGoal = 50,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'volume' | 'trajectory'>('volume');
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);

  // Adjust today's score to match the live profile score and recalculate quotaMet
  const chartData = WEEKLY_DATA.map((item, index) => {
    const isToday = index === WEEKLY_DATA.length - 1;
    return {
      ...item,
      score: isToday ? currentScore : item.score,
      quotaMet: item.questions >= dailyGoal,
    };
  });

  const totalQuestionsWeek = chartData.reduce((acc, curr) => acc + curr.questions, 0);
  const avgDailyQuestions = Math.round(totalQuestionsWeek / chartData.length);
  const daysQuotaMet = chartData.filter((d) => d.questions >= dailyGoal).length;

  return (
    <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-6">
      {/* Header with Segmented Chart Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400 font-ui block">
            Weekly Activity & Trajectory
          </span>
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-xl sm:text-2xl font-medium tracking-tight text-stone-900 dark:text-stone-100">
              {activeChartTab === 'volume'
                ? `Daily Questions vs. ${dailyGoal}-Question Benchmark`
                : 'Cut-off Score Trajectory'}
            </h2>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title:
                    activeChartTab === 'volume'
                      ? 'Daily Question Volume'
                      : 'Cut-off Trajectory Curve',
                  subtitle: '7-Day Rolling Diagnostic Window',
                  badge: 'Activity Metrics',
                  icon: activeChartTab === 'volume' ? BarChart3 : TrendingUp,
                  description: [
                    activeChartTab === 'volume'
                      ? `Visualizes daily question drill counts against your ${dailyGoal}-question benchmark. Emerald bars denote days your quota was cleared.`
                      : 'Plots your estimated UTME scaled score over time, illustrating whether your recent practice accuracy is pulling your projected aggregate toward or beyond your cut-off threshold.',
                  ],
                  tips: [
                    'Sustained volume above 50 Qs/day correlates with higher test-day recall.',
                    'Data refreshes automatically at midnight to preserve rolling weekly velocity.',
                  ],
                })
              }
              label="View Chart Guide"
            />
          </div>
        </div>

        {/* Tab Toggle with Ghost Badge & Physics */}
        <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-900/60 p-1 border border-stone-200/70 dark:border-stone-800 shrink-0 self-start sm:self-center ring-1 ring-inset ring-black/5 dark:ring-white/10">
          <button
            onClick={() => {
              playTapSound();
              setActiveChartTab('volume');
            }}
            className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium font-ui transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ${
              activeChartTab === 'volume'
                ? 'text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {activeChartTab === 'volume' && (
              <motion.div
                layoutId="activeChartModePill"
                className="absolute inset-0 rounded-lg bg-white dark:bg-[#1a1c1e] shadow-xs ring-1 ring-inset ring-black/5 dark:ring-white/10 -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <BarChart3 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            <span>Questions Drilled</span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              setActiveChartTab('trajectory');
            }}
            className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium font-ui transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ${
              activeChartTab === 'trajectory'
                ? 'text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {activeChartTab === 'trajectory' && (
              <motion.div
                layoutId="activeChartModePill"
                className="absolute inset-0 rounded-lg bg-white dark:bg-[#1a1c1e] shadow-xs ring-1 ring-inset ring-black/5 dark:ring-white/10 -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <TrendingUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
            <span>Score Trajectory</span>
          </button>
        </div>
      </div>

      {/* High-Level Vitals Strip with Machined Edges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-4 ring-1 ring-inset ring-black/5 dark:ring-white/10">
          <span className="text-[10px] uppercase font-mono font-medium text-stone-400 tracking-wider block">
            7-Day Volume
          </span>
          <span className="font-mono text-2xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums mt-0.5 block">
            <CountUp value={totalQuestionsWeek} />
            <span className="text-xs text-stone-400 font-normal font-ui ml-1">Qs</span>
          </span>
          <span className="block text-[11px] text-emerald-700 dark:text-emerald-400 font-ui mt-1 font-medium">
            Avg {avgDailyQuestions} / day
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-4 ring-1 ring-inset ring-black/5 dark:ring-white/10">
          <span className="text-[10px] uppercase font-mono font-medium text-stone-400 tracking-wider block">
            {dailyGoal}-Quota Hit
          </span>
          <span className="font-mono text-2xl font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5 block">
            <CountUp value={daysQuotaMet} />
            <span className="text-xs text-stone-400 font-normal font-ui ml-1">/ 7 days</span>
          </span>
          <span className="block text-[11px] text-stone-500 dark:text-stone-400 font-ui mt-1">
            {Math.round((daysQuotaMet / 7) * 100)}% goal adherence
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-4 ring-1 ring-inset ring-black/5 dark:ring-white/10">
          <span className="text-[10px] uppercase font-mono font-medium text-stone-400 tracking-wider block">
            Weekly Growth
          </span>
          <span className="font-mono text-2xl font-semibold text-amber-700 dark:text-amber-400 tabular-nums mt-0.5 block">
            +{Math.max(0, currentScore - 268)}
            <span className="text-xs text-stone-400 font-normal font-ui ml-1">marks</span>
          </span>
          <span className="block text-[11px] text-emerald-700 dark:text-emerald-400 font-ui mt-1 font-medium">
            Targeting {targetScore}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="pt-2">
        {activeChartTab === 'volume' ? (
          /* CHART 1: Questions Answered Per Day (Bar Chart) */
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 12, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeed" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e3' }}
                  tick={{ fontSize: 11, fill: '#747878', fontFamily: 'Inter, sans-serif' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e3' }}
                  tick={{ fontSize: 11, fill: '#747878', fontFamily: 'Inter, sans-serif' }}
                  domain={[0, 80]}
                  ticks={[0, 25, 50, 75]}
                />
                <Tooltip
                  cursor={{ fill: '#f4f5f4', opacity: 0.6 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DayData;
                      return (
                        <div className="rounded-xl border border-[#e5e5e3] bg-white p-3 shadow-lg font-ui text-xs space-y-1">
                          <div className="flex items-center justify-between gap-3 border-b border-[#f3f4f3] pb-1">
                            <span className="font-semibold text-[#1a1c1c]">{data.fullDate}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                data.questions >= dailyGoal
                                  ? 'bg-emerald-100 text-[#047857]'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {data.questions >= dailyGoal ? `${dailyGoal}+ Quota Met` : 'Below Quota'}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 text-[#747878]">
                            <span>Questions Drilled:</span>
                            <strong className="text-[#1a1c1c] tabular-nums font-semibold">
                              {data.questions} Qs
                            </strong>
                          </div>
                          <div className="flex justify-between gap-4 text-[#747878]">
                            <span>Session Accuracy:</span>
                            <strong className="text-[#059669] tabular-nums font-semibold">
                              {data.accuracy}%
                            </strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Dynamic Daily Recommendation Benchmark Line */}
                <ReferenceLine
                  y={dailyGoal}
                  stroke="#047857"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `${dailyGoal} Qs Benchmark`,
                    fill: '#047857',
                    fontSize: 10,
                    position: 'top',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <Bar dataKey="questions" radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.day === 'Today'
                          ? '#047857'
                          : entry.questions >= dailyGoal
                          ? '#10b981'
                          : '#cbd5e1'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* CHART 2: Weekly Progress & Score Trajectory (Area Chart) */
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 15, right: 12, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="scoreTrajectoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeed" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e3' }}
                  tick={{ fontSize: 11, fill: '#747878', fontFamily: 'Inter, sans-serif' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e3' }}
                  tick={{ fontSize: 11, fill: '#747878', fontFamily: 'Inter, sans-serif' }}
                  domain={[240, 340]}
                  ticks={[250, 275, 300, 325]}
                />
                <Tooltip
                  cursor={{ stroke: '#747878', strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DayData;
                      return (
                        <div className="rounded-xl border border-[#e5e5e3] bg-white p-3 shadow-lg font-ui text-xs space-y-1">
                          <div className="flex items-center justify-between gap-3 border-b border-[#f3f4f3] pb-1">
                            <span className="font-semibold text-[#1a1c1c]">{data.fullDate}</span>
                            <span className="text-[10px] font-medium text-[#747878]">
                              Cut-off Estimate
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 text-[#747878]">
                            <span>Estimated UTME Score:</span>
                            <strong className="text-[#047857] tabular-nums font-semibold font-editorial text-sm">
                              {data.score} / 400
                            </strong>
                          </div>
                          <div className="flex justify-between gap-4 text-[#747878]">
                            <span>Distance to Cut-off:</span>
                            <strong className="text-[#c2410c] tabular-nums font-semibold">
                              {targetScore - data.score > 0 ? `-${targetScore - data.score} marks` : 'Goal Reached!'}
                            </strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Target Cut-off Reference Line */}
                <ReferenceLine
                  y={targetScore}
                  stroke="#c2410c"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Target: ${targetScore}`,
                    fill: '#c2410c',
                    fontSize: 10,
                    position: 'top',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#047857"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreTrajectoryGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Explanatory Caption Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#f3f4f3] text-xs text-[#747878] font-ui">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#047857]" />
          <span>7-day rolling window recalculated every midnight</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-xs bg-[#047857]" />
            <span className="text-[11px]">Met Quota (50+)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-xs bg-[#cbd5e1]" />
            <span className="text-[11px]">&lt; 50 Qs</span>
          </div>
        </div>
      </div>

      {/* Screen Guide Bottom Sheet */}
      <ScreenGuideSheet
        isOpen={activeGuide !== null}
        onClose={() => setActiveGuide(null)}
        guide={activeGuide}
      />
    </div>
  );
};
