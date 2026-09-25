import React, { useState } from 'react';
import { UserProfile, Department, ThemeMode } from '../../types';
import { playTapSound, playCorrectSound, getSoundMuted, setSoundMuted } from '../../utils/audio';
import { applyTheme } from '../../utils/theme';
import {
  Bell,
  Clock,
  Moon,
  Sun,
  ShieldCheck,
  Volume2,
  VolumeX,
  RefreshCw,
  LogOut,
  ChevronRight,
  Check,
  Lock,
  Unlock,
  Sliders,
} from 'lucide-react';
import { DailyReminderCard } from '../Profile/DailyReminderCard';
import { ScreenGuideSheet, InfoTrigger, ScreenGuideContent } from '../Modals/ScreenGuideSheet';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSignOut?: () => void;
  onReplayIntro?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onSignOut,
  onReplayIntro,
}) => {
  const [soundMuted, setLocalSoundMuted] = useState(getSoundMuted());
  const [activeGuide, setActiveGuide] = useState<ScreenGuideContent | null>(null);

  const handleToggleSound = () => {
    const next = !soundMuted;
    setLocalSoundMuted(next);
    setSoundMuted(next);
    if (!next) {
      playTapSound();
    }
  };

  const handleToggleTheme = () => {
    playTapSound();
    const next: ThemeMode = (profile.themeMode || 'light') === 'dark' ? 'light' : 'dark';
    onUpdateProfile({ themeMode: next });
    applyTheme(next);
  };

  return (
    <div className="w-full pb-28 pt-4 px-4 space-y-6 animate-fadeIn">
      {/* Editorial Header - Pure Serif Header with Info Trigger */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#1a1c1c] dark:text-white">
            Preferences & System
          </h1>
          <InfoTrigger
            onClick={() =>
              setActiveGuide({
                title: 'System Preferences',
                subtitle: 'Alarms, Streams & Audio Synthesis',
                badge: 'System Settings',
                icon: Sliders,
                description: [
                  'Daily study reminder alarms, stream combination enforcement, and appearance themes.',
                  'Audio haptics and dark theme tokens are calibrated specifically to reduce study cognitive load and protect nocturnal eyesight.',
                ],
              })
            }
            label="View System Guide"
          />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#9ca3af] font-ui">
          Configuration
        </span>
      </section>

      {/* 1. Daily Study Reminders & Alarms */}
      <DailyReminderCard
        enabled={profile.dailyReminderEnabled}
        time={profile.dailyReminderTime || '19:30'}
        reminderDays={profile.reminderDays}
        onToggle={(enabled) => onUpdateProfile({ dailyReminderEnabled: enabled })}
        onTimeChange={(time) => onUpdateProfile({ dailyReminderTime: time })}
        onDaysChange={(days) => onUpdateProfile({ reminderDays: days })}
      />

      {/* 2. Department Stream Selection */}
      <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] p-5 paper-shadow space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#047857] dark:text-emerald-400" />
            <h2 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
              Academic Stream Track
            </h2>
            <InfoTrigger
              onClick={() =>
                setActiveGuide({
                  title: 'Academic Stream Policy',
                  subtitle: 'Compulsory Subject Rules',
                  badge: 'UTME Brochure',
                  icon: ShieldCheck,
                  description: [
                    'In UTME, Use of English is compulsory for all candidates. Practice sets and question access reflect your active departmental track.',
                    'Switching streams updates your active 4-subject curriculum across all mock exams and targeted drills.',
                  ],
                })
              }
              label="View Stream Guide"
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-ui">
            {profile.department || 'Sciences'} Active
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['Sciences', 'Commercial', 'Arts'] as Department[]).map((dept) => {
            const isCurrent = (profile.department || 'Sciences') === dept;
            return (
              <button
                key={dept}
                onClick={() => {
                  playTapSound();
                  playCorrectSound();
                  onUpdateProfile({ department: dept });
                }}
                className={`py-2.5 px-1 rounded-xl text-xs font-ui border transition-all text-center cursor-pointer ${
                  isCurrent
                    ? 'bg-[#047857] text-white border-[#047857] font-semibold shadow-xs'
                    : 'bg-[#fbfbfa] dark:bg-[#202326] text-[#747878] dark:text-[#9ca3af] border-[#e5e5e3] dark:border-[#2d3135] hover:text-[#1a1c1c] dark:hover:text-white'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* English Access Lock Status */}
        <div className="pt-3 border-t border-[#f3f4f3] dark:border-[#282b2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              profile.englishUnlocked
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
            }`}>
              {profile.englishUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div>
              <span className="text-xs font-semibold text-[#1a1c1c] dark:text-white block font-ui">
                Use of English (Core Subject)
              </span>
              <span className="text-[11px] text-[#747878] dark:text-[#9ca3af] font-ui">
                {profile.englishUnlocked
                  ? 'Access unlocked via study token across all tracks'
                  : 'Locked for everyone across all streams by default'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              playCorrectSound();
              onUpdateProfile({ englishUnlocked: !profile.englishUnlocked });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-ui transition-all flex items-center gap-1 cursor-pointer ${
              profile.englishUnlocked
                ? 'border border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8] dark:bg-[#202326] text-[#747878] dark:text-[#9ca3af] hover:text-red-500'
                : 'bg-[#c2410c] hover:bg-[#9a3412] text-white shadow-2xs'
            }`}
          >
            {profile.englishUnlocked ? (
              <>
                <Lock className="h-3 w-3" />
                <span>Lock</span>
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" />
                <span>Unlock Pass</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Appearance & Sound Controls */}
      <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] p-5 paper-shadow space-y-4">
        <h2 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
          Sensory & Theme
        </h2>

        {/* Theme row */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f3f4f3] dark:border-[#282b2e]">
          <div>
            <span className="text-xs font-semibold text-[#1a1c1c] dark:text-white block font-ui">
              Night Scholar Mode
            </span>
            <span className="text-[11px] text-[#747878] dark:text-[#9ca3af] font-ui">
              Deep charcoal focus mode engineered for late-night drills
            </span>
          </div>

          <button
            onClick={handleToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8] dark:bg-[#202326] text-xs font-medium text-[#1a1c1c] dark:text-white hover:bg-[#eeeeed] dark:hover:bg-[#25282a] transition-all cursor-pointer font-ui"
          >
            {(profile.themeMode || 'light') === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                <span>Daylight</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-[#444748]" />
                <span>Night Scholar</span>
              </>
            )}
          </button>
        </div>

        {/* Sound row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#1a1c1c] dark:text-white block font-ui">
              Haptic Audio Feedback
            </span>
            <span className="text-[11px] text-[#747878] dark:text-[#9ca3af] font-ui">
              Tactile answer sounds and completion chimes
            </span>
          </div>

          <button
            onClick={handleToggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8] dark:bg-[#202326] text-xs font-medium text-[#1a1c1c] dark:text-white hover:bg-[#eeeeed] dark:hover:bg-[#25282a] transition-all cursor-pointer font-ui"
          >
            {soundMuted ? (
              <>
                <VolumeX className="h-3.5 w-3.5 text-red-500" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#047857]" />
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Session & Replay */}
      <div className="rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#1a1c1e] p-5 paper-shadow space-y-3">
        <h2 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
          Session & Account
        </h2>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {onReplayIntro && (
            <button
              onClick={() => {
                playTapSound();
                onReplayIntro();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8] dark:bg-[#202326] p-2.5 text-xs font-medium text-[#1a1c1c] dark:text-white hover:bg-[#eeeeed] dark:hover:bg-[#25282a] active:scale-95 transition-all font-ui cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#047857]" />
              <span>Replay Intro</span>
            </button>
          )}

          {onSignOut && (
            <button
              onClick={() => {
                playTapSound();
                onSignOut();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8] dark:bg-[#202326] p-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all font-ui cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          )}
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
