import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  MessageCircle,
  Sparkles,
  Zap,
  Flame,
  Target,
  QrCode,
  Shield,
  Activity,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { playTapSound, playSuccessChime } from '../../utils/audio';
import {
  CardTheme,
  CARD_THEMES,
  getSubjectBreakdown,
  downloadScorecardPNG,
  copyScorecardImageToClipboard,
} from '../../utils/scorecardGenerator';

interface ShareScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

type ShareTone = 'peers' | 'family' | 'mentors';

export const ShareScoreModal: React.FC<ShareScoreModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('obsidian');
  const [selectedTone, setSelectedTone] = useState<ShareTone>('peers');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const subjectBreakdown = useMemo(() => getSubjectBreakdown(profile), [profile]);
  const activeThemeConfig = CARD_THEMES[selectedTheme] || CARD_THEMES.obsidian;

  const score = profile.currentEstimatedScore || 280;
  const course = profile.courseTrack?.name || 'Medicine & Surgery';
  const faculty = profile.courseTrack?.faculty || 'Clinical Sciences';
  const target = profile.targetScore || 320;
  const streak = profile.streakDays || 14;
  const accuracy = profile.accuracyRate || 82;
  const regNo = profile.jambRegNumber || '2025/UTME/0942';
  const cleanReg = regNo.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  const questionsCount = profile.totalQuestionsAnswered || 1428;

  // Punchy, culturally-tuned copy without AI slop
  const getShareMessage = (tone: ShareTone) => {
    switch (tone) {
      case 'peers':
        return `⚡ UTME '25 Stat Check: Reached ${score}/400 projected on the Scholar engine (${streak}-day Focus Streak, ${accuracy}% accuracy). Target locked on ${target} for ${course}. Lock in!`;
      case 'family':
        return `Dear family, updating you on my UTME 2025 prep: My diagnostic score is now ${score}/400 towards my target of ${target} in ${course}. Maintained a ${streak}-day Focus Streak across ${questionsCount} syllabus questions. Thank you for your support!`;
      case 'mentors':
        return `[CANDIDATE DOSSIER // UTME '25] Candidate: ${profile.name} · Track: ${course} · Est. Score: ${score}/400 (Target Cutoff: ${target}) · Focus Streak: ${streak}D · Accuracy: ${accuracy}%. Priority Targets: UNILAG / UI / OAU.`;
    }
  };

  const currentMessage = getShareMessage(selectedTone);

  const handleDownloadPNG = async () => {
    playTapSound();
    setIsDownloading(true);
    try {
      await downloadScorecardPNG(profile, selectedTheme);
      playSuccessChime();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    playTapSound();
    const success = await copyScorecardImageToClipboard(profile, selectedTheme);
    if (success) {
      playSuccessChime();
      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 2500);
    } else {
      await handleDownloadPNG();
    }
  };

  const handleCopyText = async () => {
    playTapSound();
    try {
      await navigator.clipboard.writeText(currentMessage);
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2500);
    } catch {
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    playTapSound();
    const encoded = encodeURIComponent(currentMessage);
    window.location.href = `https://wa.me/?text=${encoded}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0e1015] border border-stone-800 text-stone-100 p-5 sm:p-6 shadow-2xl max-h-[94vh] overflow-y-auto flex flex-col gap-5 no-scrollbar">
        {/* Top classified intel bar */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full animate-pulse bg-[#ccff00]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#ccff00] leading-none">
              CLASSIFIED DOSSIER // LOG_{cleanReg}
            </span>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Edition Switcher (Obsidian, Cyber, Quartz) - Concentric Rounded-xl with Rounded-lg items */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 leading-none">
            Aesthetic Matrix
          </span>
          <div className="flex gap-1.5 p-1 bg-stone-900 rounded-xl border border-stone-800">
            {(
              [
                { id: 'obsidian', label: 'Obsidian', color: '#ccff00' },
                { id: 'cyber', label: 'Cyber Blue', color: '#00f0ff' },
                { id: 'quartz', label: 'Neon Quartz', color: '#ff5e62' },
              ] as const
            ).map((theme) => {
              const active = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    playTapSound();
                    setSelectedTheme(theme.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    active
                      ? 'bg-stone-800 text-white font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span>{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Modern Dossier Card Visual Preview (Concentric Rounded-2xl) */}
        <div
          className="relative rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-2xl overflow-hidden select-none border flex flex-col gap-3.5"
          style={{
            background: `linear-gradient(145deg, ${activeThemeConfig.surfaceBg} 0%, ${activeThemeConfig.surfaceEnd} 100%)`,
            borderColor: activeThemeConfig.borderSubtle,
            color: activeThemeConfig.textPrimary,
          }}
        >
          {/* Subtle Dot Matrix Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${activeThemeConfig.accentNeon} 1px, transparent 0)`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Corner brackets */}
          <div
            className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 pointer-events-none"
            style={{ borderColor: activeThemeConfig.accentNeon }}
          />
          <div
            className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 pointer-events-none"
            style={{ borderColor: activeThemeConfig.accentNeon }}
          />
          <div
            className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 pointer-events-none"
            style={{ borderColor: activeThemeConfig.accentNeon }}
          />
          <div
            className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 pointer-events-none"
            style={{ borderColor: activeThemeConfig.accentNeon }}
          />

          {/* Card Top Line */}
          <div className="relative flex items-center justify-between pb-2 border-b border-white/10 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: activeThemeConfig.accentNeon }}
              />
              <span style={{ color: activeThemeConfig.accentNeon }}>OPERATIVE // RECORD</span>
            </div>
            <span style={{ color: activeThemeConfig.textMuted }}>
              UID: CANDIDATE_{cleanReg}
            </span>
          </div>

          {/* Candidate Profile Details & Barcode with Tightened Leading */}
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-ui leading-tight">
                {profile.name}
              </h3>
              <p
                className="text-xs font-mono uppercase tracking-wide leading-none"
                style={{ color: activeThemeConfig.accentSecondary }}
              >
                {course} // {faculty}
              </p>
            </div>

            {/* Tech Barcode Element */}
            <div className="shrink-0 flex flex-col items-end gap-1">
              <div className="flex gap-[2px] h-6 items-center justify-end">
                {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 1, 3].map((w, idx) => (
                  <div
                    key={idx}
                    className="h-full bg-white/70"
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-stone-500 leading-none">
                *2025-UTME*
              </span>
            </div>
          </div>

          {/* Hero Score Showcase (Concentric Rounded-xl with Perfect Baseline Lockup) */}
          <div
            className="rounded-xl p-4 border relative overflow-hidden backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: activeThemeConfig.borderGlow,
            }}
          >
            <div className="flex items-baseline justify-between">
              <div className="flex flex-col gap-1">
                <span
                  className="text-[10px] font-mono uppercase tracking-widest leading-none block"
                  style={{ color: activeThemeConfig.accentNeon }}
                >
                  PROJECTED_UTME_SCORE
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">
                    {score}
                  </span>
                  <span className="text-xs font-mono leading-none" style={{ color: activeThemeConfig.textMuted }}>
                    / 400
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 text-right">
                <span
                  className="text-[10px] font-mono uppercase tracking-wider leading-none block"
                  style={{ color: activeThemeConfig.textMuted }}
                >
                  CLEARANCE PACE
                </span>
                <span
                  className="text-xs font-mono font-bold leading-none block"
                  style={{
                    color: score >= target ? activeThemeConfig.accentNeon : '#f59e0b',
                  }}
                >
                  {score >= target
                    ? `MERIT CLEARED (+${score - target} PTS)`
                    : `${target - score} PTS TO TARGET`}
                </span>
                <span className="text-[10px] font-mono text-stone-500 leading-none">
                  TOP 2.4% NATIONAL COHORT
                </span>
              </div>
            </div>
          </div>

          {/* Player Stats Row: Focus Streak, Accuracy, Velocity (Concentric Rounded-lg & Stamped Material) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-2.5 bg-white/[0.04] border border-white/[0.06] flex flex-col gap-1">
              <span className="text-[9px] font-mono text-stone-400 leading-none block">FOCUS STREAK</span>
              <div className="flex items-baseline gap-1">
                <Flame className="h-3 w-3 text-amber-400 self-center" />
                <span className="font-mono text-sm font-bold leading-none">{streak}</span>
                <span className="text-[10px] font-mono text-stone-400 leading-none">DAYS</span>
              </div>
            </div>

            <div className="rounded-lg p-2.5 bg-white/[0.04] border border-white/[0.06] flex flex-col gap-1">
              <span className="text-[9px] font-mono text-stone-400 leading-none block">ACCURACY RATE</span>
              <div className="flex items-baseline gap-0.5">
                <Target className="h-3 w-3 text-emerald-400 self-center" />
                <span className="font-mono text-sm font-bold leading-none">{accuracy}</span>
                <span className="text-[10px] font-mono text-stone-400 leading-none">%</span>
              </div>
            </div>

            <div className="rounded-lg p-2.5 bg-white/[0.04] border border-white/[0.06] flex flex-col gap-1">
              <span className="text-[9px] font-mono text-stone-400 leading-none block">QUESTIONS</span>
              <div className="flex items-baseline gap-1">
                <Zap className="h-3 w-3 text-cyan-400 self-center" />
                <span className="font-mono text-sm font-bold leading-none">{questionsCount}</span>
                <span className="text-[10px] font-mono text-stone-400 leading-none">Qs</span>
              </div>
            </div>
          </div>

          {/* 4 Subjects with Dashed Energy Bars (Concentric Rounded-lg & Stamped Material) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
            {subjectBreakdown.map((subj, idx) => (
              <div key={idx} className="rounded-lg p-2.5 bg-white/[0.04] border border-white/[0.06] flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-stone-400 truncate block leading-none">
                  {subj.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm font-bold leading-none">
                    {subj.score}
                  </span>
                  <span className="text-[9px] font-mono text-stone-500 leading-none">/100</span>
                </div>
                {/* Dashed energy bar */}
                <div className="flex gap-[2px]">
                  {[...Array(6)].map((_, bi) => {
                    const active = (subj.score / 100) * 6 > bi;
                    return (
                      <div
                        key={bi}
                        className="h-1 flex-1 rounded-xs"
                        style={{
                          backgroundColor: active
                            ? activeThemeConfig.accentNeon
                            : 'rgba(255,255,255,0.08)',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Intel coordinates footer */}
          <div className="flex items-center justify-between text-[9px] font-mono text-stone-500 pt-1">
            <span>PRIORITY TARGETS // UNILAG · UI · OAU</span>
            <span>VERIFIED BY SCHOLAR</span>
          </div>
        </div>

        {/* Tone Selection Tabs (Peers, Family, Mentors) - Concentric Rounded-xl with Rounded-lg buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-stone-400 uppercase text-[11px] leading-none">
              Share Message Format
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-900 rounded-xl border border-stone-800">
            {(
              [
                { id: 'peers', label: 'Peers & Squad' },
                { id: 'family', label: 'Family' },
                { id: 'mentors', label: 'Academic Dossier' },
              ] as const
            ).map((tone) => (
              <button
                key={tone.id}
                onClick={() => {
                  playTapSound();
                  setSelectedTone(tone.id);
                }}
                className={`py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                  selectedTone === tone.id
                    ? 'bg-stone-800 text-white font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {tone.label}
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs font-mono text-stone-300 leading-relaxed">
            {currentMessage}
          </div>
        </div>

        {/* Actions Grid (Concentric Rounded-xl Buttons) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-[#ccff00] text-black font-mono font-bold text-xs hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#ccff00]/10"
          >
            {isDownloading ? (
              <span>Generating...</span>
            ) : downloadSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Saved PNG!</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Save Dossier PNG</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyImage}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-mono text-xs border border-stone-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            {imageCopied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Image Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};
