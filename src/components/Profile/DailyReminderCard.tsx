import React, { useState } from 'react';
import { Bell, BellRing, Clock, Check, Send, Calendar } from 'lucide-react';
import { playTapSound, playCorrectSound } from '../../utils/audio';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

interface DailyReminderCardProps {
  enabled: boolean;
  time: string; // format "HH:mm" (24-hour e.g. "19:30")
  reminderDays?: string[];
  onToggle: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  onDaysChange?: (days: string[]) => void;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIME_PRESETS = [
  { label: 'Morning Drill', time: '07:00', desc: '7:00 AM' },
  { label: 'Afternoon Break', time: '14:30', desc: '2:30 PM' },
  { label: 'Evening Review', time: '19:30', desc: '7:30 PM' },
  { label: 'Night Owl', time: '21:30', desc: '9:30 PM' },
];

export const DailyReminderCard: React.FC<DailyReminderCardProps> = ({
  enabled,
  time,
  reminderDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  onToggle,
  onTimeChange,
  onDaysChange,
}) => {
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(reminderDays);
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);

  // Parse 24h string "HH:mm" into hours (1-12), minutes, and period (AM/PM)
  const [hours24Str, minutesStr] = (time || '19:30').split(':');
  const hours24 = parseInt(hours24Str, 10) || 19;
  const minutes = parseInt(minutesStr, 10) || 30;

  const period: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const updateTime = (h12: number, mins: number, ampm: 'AM' | 'PM') => {
    let h24 = h12 % 12;
    if (ampm === 'PM') h24 += 12;
    const formatted = `${String(h24).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    onTimeChange(formatted);
  };

  const handleHourStep = (delta: number) => {
    playTapSound();
    let nextH12 = hours12 + delta;
    if (nextH12 > 12) nextH12 = 1;
    if (nextH12 < 1) nextH12 = 12;
    updateTime(nextH12, minutes, period);
  };

  const handleMinuteStep = (delta: number) => {
    playTapSound();
    let nextMins = minutes + delta;
    if (nextMins >= 60) nextMins = 0;
    if (nextMins < 0) nextMins = 55;
    updateTime(hours12, nextMins, period);
  };

  const handleTogglePeriod = (newPeriod: 'AM' | 'PM') => {
    playTapSound();
    updateTime(hours12, minutes, newPeriod);
  };

  const handleToggleDay = (day: string) => {
    playTapSound();
    let updated: string[];
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // keep at least 1 day
      updated = selectedDays.filter((d) => d !== day);
    } else {
      updated = [...selectedDays, day];
    }
    setSelectedDays(updated);
    if (onDaysChange) onDaysChange(updated);
  };

  const handleSendTest = () => {
    playCorrectSound();
    setTestNotificationSent(true);
    // Request system notification if supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification('Scholar · JAMB Prep', {
              body: 'Time for your daily 15-minute diagnostic drill! Keep your streak burning.',
              icon: '/favicon.ico',
            });
          }
        });
      } else if (Notification.permission === 'granted') {
        new Notification('Scholar · JAMB Prep', {
          body: 'Time for your daily 15-minute diagnostic drill! Keep your streak burning.',
          icon: '/favicon.ico',
        });
      }
    }
    setTimeout(() => setTestNotificationSent(false), 4500);
  };

  const formattedDisplayTime = `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;

  return (
    <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#1a1c1e] p-6 paper-shadow ring-1 ring-inset ring-black/5 dark:ring-white/10 space-y-5 transition-all">
      {/* Header and Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ring-1 ring-inset ring-black/5 dark:ring-white/10 ${
              enabled
                ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}
          >
            {enabled ? (
              <BellRing className="h-5 w-5 animate-bounce-subtle" strokeWidth={1.5} />
            ) : (
              <Bell className="h-5 w-5" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-lg font-medium text-stone-900 dark:text-stone-100">
                Daily Reminder
              </h3>
              <InfoTrigger
                onClick={() =>
                  setActiveGuide({
                    title: 'Daily Study Alarms',
                    subtitle: 'Notification & Habit Preservation',
                    badge: 'Habit Anchor',
                    icon: BellRing,
                    description: [
                      'Push notifications prompt a focused 15-minute diagnostic drill at your designated hour.',
                      'Consistent daily practice protects your active day streak and builds automatic recall conditioning ahead of UTME 2025.',
                    ],
                  })
                }
                label="View Reminder Guide"
              />
              {enabled && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </div>
          </div>
        </div>

        {/* Tactile Toggle Switch */}
        <button
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle daily reminder notification"
          onClick={() => {
            playTapSound();
            onToggle(!enabled);
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enabled ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-200 dark:bg-stone-800'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-stone-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {enabled ? (
        <div className="space-y-4 pt-3 border-t border-stone-100 dark:border-stone-800 animate-fadeIn">
          {/* Time Picker Controls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-ui flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Reminder Time</span>
              </span>
              <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100 border border-stone-200/70 dark:border-stone-700/60 bg-transparent px-2.5 py-0.5 rounded-full tabular-nums">
                {formattedDisplayTime}
              </span>
            </div>

            {/* Tactile Minimalist Time-Picker Dials */}
            <div className="flex items-center justify-center gap-3.5 rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 p-4 ring-1 ring-inset ring-black/5 dark:ring-white/10">
              {/* Hours Column */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleHourStep(1)}
                  aria-label="Increase hour"
                  className="flex h-7 w-12 items-center justify-center rounded-lg border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-[#1a1c1e] text-xs font-semibold text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
                >
                  ▲
                </button>
                <div className="flex h-11 w-14 items-center justify-center rounded-xl border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-[#1a1c1e] font-mono text-xl font-semibold text-stone-900 dark:text-stone-100 shadow-xs tabular-nums ring-1 ring-inset ring-black/5 dark:ring-white/10">
                  {String(hours12).padStart(2, '0')}
                </div>
                <button
                  onClick={() => handleHourStep(-1)}
                  aria-label="Decrease hour"
                  className="flex h-7 w-12 items-center justify-center rounded-lg border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-[#1a1c1e] text-xs font-semibold text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
                >
                  ▼
                </button>
                <span className="text-[10px] text-stone-400 font-ui mt-0.5">Hour</span>
              </div>

              {/* Colon Separator */}
              <span className="font-mono text-2xl font-bold text-stone-400 mb-5">:</span>

              {/* Minutes Column */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleMinuteStep(5)}
                  aria-label="Increase minutes"
                  className="flex h-7 w-12 items-center justify-center rounded-lg border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-[#1a1c1e] text-xs font-semibold text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
                >
                  ▲
                </button>
                <div className="flex h-11 w-14 items-center justify-center rounded-xl border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-[#1a1c1e] font-mono text-xl font-semibold text-stone-900 dark:text-stone-100 shadow-xs tabular-nums ring-1 ring-inset ring-black/5 dark:ring-white/10">
                  {String(minutes).padStart(2, '0')}
                </div>
                <button
                  onClick={() => handleMinuteStep(-5)}
                  aria-label="Decrease minutes"
                  className="flex h-7 w-12 items-center justify-center rounded-lg border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-[#1a1c1e] text-xs font-semibold text-stone-900 dark:text-stone-100 hover:opacity-90 active:scale-[0.98] duration-200 ease-out transition-all cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10"
                >
                  ▼
                </button>
                <span className="text-[10px] text-stone-400 font-ui mt-0.5">Min</span>
              </div>

              {/* AM / PM Segmented Selector */}
              <div className="flex flex-col gap-1.5 ml-2">
                <button
                  onClick={() => handleTogglePeriod('AM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-ui transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ${
                    period === 'AM'
                      ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-xs ring-1 ring-inset ring-black/5 dark:ring-white/10'
                      : 'border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-[#1a1c1e] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  AM
                </button>
                <button
                  onClick={() => handleTogglePeriod('PM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-ui transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ${
                    period === 'PM'
                      ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-xs ring-1 ring-inset ring-black/5 dark:ring-white/10'
                      : 'border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-[#1a1c1e] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Quick Preset Slots */}
          <div>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-ui block mb-1.5 uppercase font-medium tracking-wider">
              Quick Schedules:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {TIME_PRESETS.map((preset) => {
                const isSelected = time === preset.time;
                return (
                  <button
                    key={preset.time}
                    onClick={() => {
                      playTapSound();
                      onTimeChange(preset.time);
                    }}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10 ${
                      isSelected
                        ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 font-medium shadow-xs'
                        : 'border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 hover:opacity-90'
                    }`}
                  >
                    <span className="font-ui text-[11px] truncate">{preset.label}</span>
                    <span
                      className={`font-mono text-[10px] tabular-nums ${
                        isSelected ? 'text-stone-200 dark:text-stone-800' : 'text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Frequency Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-ui flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Active Days</span>
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium font-ui">
                {selectedDays.length === 7 ? 'Every Day' : `${selectedDays.length} days/week`}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {ALL_DAYS.map((day) => {
                const isActive = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => handleToggleDay(day)}
                    className={`py-2 rounded-xl text-xs font-semibold font-ui transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ring-1 ring-inset ring-black/5 dark:ring-white/10 ${
                      isActive
                        ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 shadow-xs'
                        : 'border border-stone-200/70 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {day[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Notification Action & Banner */}
          <div className="pt-1 space-y-2">
            <button
              onClick={handleSendTest}
              className="btn-matte flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold font-ui shadow-xs cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Send Sample Study Reminder</span>
            </button>

            {testNotificationSent && (
              <div className="rounded-xl border border-emerald-300/60 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 text-xs font-ui text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 animate-fadeIn ring-1 ring-inset ring-black/5 dark:ring-white/10">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white mt-0.5">
                  <Check className="h-3 w-3" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                    Push Notification Dispatched
                  </div>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    “⏰ Scholar: Time for your daily 15-minute JAMB diagnostic! Keep your streak burning.”
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 p-3.5 text-xs text-stone-500 dark:text-stone-400 font-ui flex items-center justify-between ring-1 ring-inset ring-black/5 dark:ring-white/10">
          <span>Reminders are paused. Turn on switch to set your daily study alarm.</span>
          <span className="text-[10px] uppercase font-mono font-medium text-stone-500 border border-stone-200/70 dark:border-stone-700/60 px-2 py-0.5 rounded-full">
            Inactive
          </span>
        </div>
      )}
      {/* Screen Guide Bottom Sheet */}
      <ScreenGuideSheet
        isOpen={activeGuide !== null}
        onClose={() => setActiveGuide(null)}
        guide={activeGuide}
      />
    </div>
  );
};
