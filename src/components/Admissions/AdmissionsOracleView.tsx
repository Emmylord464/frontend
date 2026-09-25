'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CourseTrack } from '../../types';
import { playTapSound } from '../../utils/audio';
import { UNIVERSITIES_DIRECTORY, UniversityData } from '../../data/universitiesData';
import { CountUp } from '../Motion/CountUp';
import {
  Building2,
  GraduationCap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Sliders,
  Compass,
} from 'lucide-react';

interface AdmissionsOracleViewProps {
  profile: UserProfile;
  onNavigateToDrill?: (subjectId: string) => void;
  onSelectCourseTrack?: (track: CourseTrack) => void;
}

const PRESET_SCORES = [280, 300, 320, 340, 360];

export const AdmissionsOracleView: React.FC<AdmissionsOracleViewProps> = ({
  profile,
  onNavigateToDrill,
}) => {
  // Candidate Selected University Choice (Default: UNILAG)
  const [selectedUniId, setSelectedUniId] = useState<string>('unilag');
  const [targetScore, setTargetScore] = useState<number>(profile.targetScore || 320);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedUni = useMemo(() => {
    return UNIVERSITIES_DIRECTORY.find((u) => u.id === selectedUniId) || UNIVERSITIES_DIRECTORY[0];
  }, [selectedUniId]);

  const targetCourseName = profile.courseTrack?.name || 'Medicine & Surgery';
  const cutoffInfo =
    selectedUni.courseCutoffs[targetCourseName] || Object.values(selectedUni.courseCutoffs)[0] || {
      aggregate: 75.0,
      utmeMin: 280,
    };

  // Deficit / Surplus calculation
  const scoreDiff = (profile.currentEstimatedScore || 294) - (cutoffInfo.utmeMin || selectedUni.generalCutOff);
  const isCompetitive = scoreDiff >= 0;

  // 2 Curated Alternative Recommendations (Ultra-Clean, High Match)
  const recommendations = useMemo(() => {
    return UNIVERSITIES_DIRECTORY.filter(
      (u) => u.id !== selectedUni.id && u.popularCourses.some((c) => c.toLowerCase().includes(targetCourseName.toLowerCase()))
    ).slice(0, 2);
  }, [selectedUni.id, targetCourseName]);

  // Dropdown list filtering
  const dropdownList = useMemo(() => {
    if (!searchQuery.trim()) return UNIVERSITIES_DIRECTORY;
    return UNIVERSITIES_DIRECTORY.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectUni = (id: string) => {
    playTapSound();
    setSelectedUniId(id);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="w-full flex-1 flex flex-col px-3.5 sm:px-5 py-4 max-w-lg mx-auto space-y-4 select-none pb-24 text-stone-900 dark:text-stone-100">
      {/* ─── Ultra-Quiet Editorial Header ─── */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-stone-400">
          <Compass className="w-3.5 h-3.5 text-[#c2410c]" strokeWidth={1.5} />
          <span>Institutional Admissions Dossier</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
          Admissions Blueprint
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Calibrated against official verified merit cut-offs, screening formulas, and alumni records.
        </p>
      </div>

      {/* ─── Step 1: Target University Selector (Quiet Luxury Pill / Dropdown) ─── */}
      <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#181a1c] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
            Primary University of Choice
          </label>
          <span className="text-[10px] text-stone-400 font-mono">
            {UNIVERSITIES_DIRECTORY.length} Accredited Institutions
          </span>
        </div>

        {/* Selected University Active Capsule */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setIsDropdownOpen((prev) => !prev);
            }}
            className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-[#121314] flex items-center justify-between hover:border-stone-400 dark:hover:border-stone-600 transition-colors text-left cursor-pointer"
          >
            <div className="space-y-0.5 truncate pr-2">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-white truncate">
                  {selectedUni.name} ({selectedUni.shortName})
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shrink-0">
                  {selectedUni.type}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono truncate">
                {selectedUni.location} · {selectedUni.state}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Searchable All-Universities Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1e20] shadow-xl p-2 space-y-1.5 max-h-64 overflow-y-auto"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search institution..."
                  className="w-full px-3 py-2 rounded-lg bg-stone-100 dark:bg-[#141517] text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden mb-1"
                  autoFocus
                />

                <div className="space-y-0.5">
                  {dropdownList.map((uni) => (
                    <button
                      key={uni.id}
                      type="button"
                      onClick={() => handleSelectUni(uni.id)}
                      className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors cursor-pointer ${
                        selectedUni.id === uni.id
                          ? 'bg-stone-100 dark:bg-stone-800 font-semibold text-stone-900 dark:text-white'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      <span className="truncate">{uni.name} ({uni.shortName})</span>
                      <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-2">
                        {uni.type}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Target Score Presets */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>Target UTME Score Benchmark</span>
            <span className="text-stone-900 dark:text-white font-semibold font-serif text-sm">
              {targetScore} / 400
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_SCORES.map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => {
                  playTapSound();
                  setTargetScore(score);
                }}
                className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  targetScore === score
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Step 2: Bespoke University Blueprint (Primary Hero Card) ─── */}
      <motion.div
        key={selectedUni.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-5 shadow-2xs space-y-4"
      >
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 border-b border-stone-100 dark:border-stone-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#c2410c] font-bold">
                ● {selectedUni.status}
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                · {selectedUni.lastUpdated}
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-white mt-0.5">
              {selectedUni.shortName} Admission Blueprint
            </h2>
          </div>

          <a
            href={selectedUni.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTapSound()}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-1 text-[11px] font-mono cursor-pointer shrink-0"
            title="Open official university portal in new tab"
          >
            <span>Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 3 Core Calibrated Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-stone-50 dark:bg-[#121314] p-3 rounded-2xl border border-stone-100 dark:border-stone-800/80 text-center">
          <div>
            <span className="text-[9px] uppercase font-mono text-stone-400 block">Course Cutoff</span>
            <span className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-white">
              {cutoffInfo.utmeMin > 0 ? `${cutoffInfo.utmeMin}+` : `${cutoffInfo.aggregate} pts`}
            </span>
          </div>

          <div className="border-x border-stone-200 dark:border-stone-800">
            <span className="text-[9px] uppercase font-mono text-stone-400 block">Est. Aggregate</span>
            <span className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-white">
              {cutoffInfo.aggregate}%
            </span>
          </div>

          <div>
            <span className="text-[9px] uppercase font-mono text-stone-400 block">Pace Status</span>
            <span
              className={`font-mono text-xs font-bold block mt-0.5 ${
                isCompetitive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {isCompetitive ? `+${scoreDiff} Safe` : `${scoreDiff} Deficit`}
            </span>
          </div>
        </div>

        {/* Alumni & Employability Verdict */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Alumni Employability Index
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ★ {selectedUni.alumniRating} · {selectedUni.employabilityScore}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed bg-stone-50/60 dark:bg-stone-900/30 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800/60">
            "{selectedUni.alumniReport}"
          </p>
        </div>

        {/* Screening Protocol Breakdown */}
        <div className="text-[11px] text-stone-600 dark:text-stone-300 space-y-1 pt-1">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Screening Format & Requirement</span>
          </div>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
            {selectedUni.postUtmeFormat}: {selectedUni.screeningRequirements}
          </p>
        </div>

        {/* 1-Tap Practice Post-UTME Button */}
        {onNavigateToDrill && (
          <button
            onClick={() => {
              playTapSound();
              onNavigateToDrill('all');
            }}
            className="w-full py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Practice {selectedUni.shortName} Post-UTME Past Questions</span>
          </button>
        )}
      </motion.div>

      {/* ─── Step 3: Strong Alternative Recommendations (Max 2 Quiet Cards) ─── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
            Recommended High-Match Alternatives
          </span>
          <span className="text-[10px] text-stone-400 font-mono">For {targetCourseName}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#181a1c] p-3.5 flex flex-col justify-between space-y-2 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-semibold text-stone-900 dark:text-white">{rec.shortName}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">★ {rec.alumniRating}</span>
                </div>
                <h4 className="font-serif font-bold text-xs text-stone-800 dark:text-stone-200 line-clamp-1">
                  {rec.name}
                </h4>
                <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                  {rec.alumniReport}
                </p>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectUni(rec.id)}
                  className="flex-1 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[10px] font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-center cursor-pointer"
                >
                  View Blueprint
                </button>
                <a
                  href={rec.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playTapSound()}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Official portal"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
