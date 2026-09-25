'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  GraduationCap,
  Sparkles,
  Award,
  ShieldCheck,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { playTapSound, playSuccessChime } from '../../utils/audio';

interface ShareScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  examScore?: number;
  subjectScores?: { subjectName: string; correct: number; total: number; scaledScore: number }[];
}

export const ShareScoreModal: React.FC<ShareScoreModalProps> = ({
  isOpen,
  onClose,
  profile,
  examScore,
  subjectScores,
}) => {
  const [selectedAudience, setSelectedAudience] = useState<'family' | 'social'>('family');
  const [copiedText, setCopiedText] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const finalScore = examScore || profile.currentEstimatedScore || 312;
  const course = profile.courseTrack?.name || 'Medicine & Surgery';
  const target = profile.targetScore || 320;
  const streak = profile.streakDays || 14;
  const accuracy = profile.accuracyRate || 82;
  const regNo = profile.jambRegNumber || '2025/UTME/0942';

  const defaultScores = useMemo(() => {
    if (subjectScores && subjectScores.length > 0) return subjectScores;
    return [
      { subjectName: 'Use of English', correct: 42, total: 50, scaledScore: 84 },
      { subjectName: 'Mathematics', correct: 38, total: 50, scaledScore: 76 },
      { subjectName: 'Physics', correct: 40, total: 50, scaledScore: 80 },
      { subjectName: 'Chemistry', correct: 42, total: 50, scaledScore: 84 },
    ];
  }, [subjectScores]);

  // Pre-formatted messages
  const shareMessage = useMemo(() => {
    if (selectedAudience === 'family') {
      return `🎓 Proud to share my JAMB UTME Mock Exam Results!\n\nCandidate: ${profile.name}\nProjected Composite Score: ${finalScore} / 400\nTarget Course: ${course} (Cutoff Goal: ${target})\nFocus Streak: ${streak} Days · Accuracy: ${accuracy}%\n\n${defaultScores.map((s) => `• ${s.subjectName}: ${s.correct}/50 (${s.scaledScore} pts)`).join('\n')}\n\nPrepared on JAMB Scholar Platform. Thank you for your prayers and support! 🌟`;
    }
    return `⚡ Just locked in a ${finalScore}/400 in the strict 200-Question JAMB CBT Simulation on Scholar!\n\n📚 Course: ${course}\n🎯 Target: ${target}+\n🔥 ${streak}-Day Focus Streak | ${accuracy}% Accuracy\n\nUNILAG / UI / OAU merit cutoff locked in. #JAMB2025 #UTMEPrep`;
  }, [selectedAudience, profile.name, finalScore, course, target, streak, accuracy, defaultScores]);

  const handleCopyText = async () => {
    playTapSound();
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedText(true);
      playSuccessChime();
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    playTapSound();
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleTwitterShare = () => {
    playTapSound();
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0e1013] border border-stone-800 text-stone-100 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[94vh] overflow-y-auto no-scrollbar">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider font-semibold">
              Official Scholar Scorecard
            </span>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── The Cinematic Scholar Scorecard (Intro Theme Look) ─── */}
        <div
          id="scholar-scorecard-render"
          className="relative rounded-3xl p-5 border border-stone-700/80 bg-gradient-to-b from-[#16181d] via-[#101216] to-[#0b0c0e] shadow-2xl overflow-hidden space-y-4"
        >
          {/* Subtle Radial Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#c2410c]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Monogram with Scholar S & Graduation Cap */}
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              {/* The Iconic Scholar 'S' + Graduation Cap Emblem */}
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 border border-stone-700/80 shadow-inner">
                <span className="font-serif text-2xl font-bold text-white tracking-tighter">
                  S
                </span>
                <GraduationCap className="absolute -top-1.5 -right-1.5 w-4 h-4 text-amber-400 drop-shadow-md" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c2410c] font-bold block leading-none">
                  JAMB SCHOLAR
                </span>
                <span className="text-xs font-serif font-bold text-white tracking-wide">
                  UTME 2025 Merit Dossier
                </span>
              </div>
            </div>

            <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[9px] font-mono font-bold">
              VERIFIED CBT
            </span>
          </div>

          {/* Candidate Info & Composite Score */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                  {profile.name}
                </h3>
                <p className="text-[11px] font-mono text-stone-400">
                  {course} · Target: {target}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono uppercase text-stone-400 block">Score</span>
                <span className="font-serif text-3xl font-bold text-white tracking-tight leading-none">
                  {finalScore}
                  <span className="text-xs font-normal text-stone-400 font-mono">/400</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4 Subjects Performance Grid */}
          <div className="grid grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-2xl border border-stone-800/80 text-xs">
            {defaultScores.map((s) => (
              <div key={s.subjectName} className="p-1.5 rounded-lg bg-stone-900/50">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span className="truncate">{s.subjectName.replace('Use of ', '')}</span>
                  <span className="font-bold text-emerald-400">{s.scaledScore}</span>
                </div>
                <div className="text-[11px] font-serif font-bold text-white">
                  {s.correct} / {s.total}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Clearance Badge */}
          <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-stone-400 border-t border-stone-800/80">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Pace: Cleared for Top Federal Cutoff</span>
            </div>
            <span>Reg: {regNo}</span>
          </div>
        </div>

        {/* ─── Share Audience Selector ─── */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-mono uppercase text-stone-400">Format For:</span>
          <div className="flex gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => {
                playTapSound();
                setSelectedAudience('family');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedAudience === 'family'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              👨‍👩‍👧 Family & Mentors
            </button>
            <button
              onClick={() => {
                playTapSound();
                setSelectedAudience('social');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedAudience === 'social'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              📱 Social & Friends
            </button>
          </div>
        </div>

        {/* ─── 1-Tap Sharing Buttons ─── */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleWhatsAppShare}
            className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <span>Share to WhatsApp</span>
          </button>

          <button
            onClick={handleTwitterShare}
            className="py-3 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <span>Post on X / Social</span>
          </button>
        </div>

        {/* Copy Text / Image Button */}
        <button
          onClick={handleCopyText}
          className="w-full py-2.5 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-900/60 text-stone-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {copiedText ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scorecard Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Scorecard Summary Text</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
