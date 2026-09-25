'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CourseTrack } from '../../types';
import { playTapSound } from '../../utils/audio';
import { UNIVERSITIES_DIRECTORY, UniversityData } from '../../data/universitiesData';
import { CountUp } from '../Motion/CountUp';
import {
  ExternalLink,
  ChevronDown,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  TrendingUp,
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

  // 2 Curated Alternative Recommendations
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
    <div className="w-full flex-1 flex flex-col px-3.5 sm:px-5 py-3 max-w-lg mx-auto space-y-3.5 select-none pb-24 text-stone-900 dark:text-stone-100">
      {/* ─── Ultra-Reduced Header with Circular Subtext Badge ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
            Admissions Oracle
          </h1>
          <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-mono text-stone-500 dark:text-stone-400 font-semibold border border-stone-200/60 dark:border-stone-700/60">
            UTME '25
          </span>
        </div>

        <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-semibold border border-amber-200/60 dark:border-amber-800/60">
          ● {selectedUni.status}
        </span>
      </div>

      {/* ─── Institution & Target Score Selector Card ─── */}
      <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#181a1c] p-3.5 shadow-2xs space-y-2.5">
        {/* University Selector Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setIsDropdownOpen((prev) => !prev);
            }}
            className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-[#121314] flex items-center justify-between hover:border-stone-400 dark:hover:border-stone-600 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-white truncate">
                {selectedUni.name} ({selectedUni.shortName})
              </span>
              <span className="inline-flex items-center justify-center h-4.5 px-2 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[9px] font-semibold shrink-0">
                {selectedUni.type}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Searchable Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1e20] shadow-xl p-2 space-y-1 max-h-64 overflow-y-auto"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 100+ universities..."
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-[#141517] text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden mb-1"
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
                      <span className="inline-flex items-center justify-center h-4 px-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[9px] font-mono text-stone-400 shrink-0 ml-2">
                        {uni.type}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Target Score Preset Pills */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <span className="text-[10px] font-mono text-stone-400 shrink-0">Score Target</span>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {PRESET_SCORES.map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => {
                  playTapSound();
                  setTargetScore(score);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
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

      {/* ─── Primary Hero Admission Card ─── */}
      <motion.div
        key={selectedUni.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-4 sm:p-5 shadow-2xs space-y-3.5"
      >
        {/* Card Header & Circular Metric Chips */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800/80 pb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
              {selectedUni.employabilityScore}
            </span>
            <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-semibold border border-amber-200/60 dark:border-amber-800/60">
              ★ {selectedUni.alumniRating}
            </span>
            <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[10px]">
              {selectedUni.postUtmeFormat}
            </span>
          </div>

          <a
            href={selectedUni.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTapSound()}
            className="inline-flex items-center justify-center h-6 px-2.5 rounded-full border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors text-[10px] font-mono cursor-pointer shrink-0 gap-1"
            title="Open official university portal in new tab"
          >
            <span>Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* 3 Core Minimal Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-stone-50 dark:bg-[#121314] p-2.5 rounded-2xl border border-stone-100 dark:border-stone-800/80 text-center">
          <div>
            <span className="text-[9px] uppercase font-mono text-stone-400 block">Cutoff</span>
            <span className="font-serif text-sm sm:text-base font-bold text-stone-900 dark:text-white">
              {cutoffInfo.utmeMin > 0 ? `${cutoffInfo.utmeMin}+` : `${cutoffInfo.aggregate} pts`}
            </span>
          </div>

          <div className="border-x border-stone-200 dark:border-stone-800">
            <span className="text-[9px] uppercase font-mono text-stone-400 block">Aggregate</span>
            <span className="font-serif text-sm sm:text-base font-bold text-stone-900 dark:text-white">
              {cutoffInfo.aggregate}%
            </span>
          </div>

          <div>
            <span className="text-[9px] uppercase font-mono text-stone-400 block">Status</span>
            <span
              className={`font-mono text-[11px] font-bold block mt-0.5 ${
                isCompetitive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {isCompetitive ? `+${scoreDiff} Safe` : `${scoreDiff} Deficit`}
            </span>
          </div>
        </div>

        {/* Action Button: 1-Tap Post-UTME Practice */}
        {onNavigateToDrill && (
          <button
            onClick={() => {
              playTapSound();
              onNavigateToDrill('all');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice {selectedUni.shortName} Post-UTME Drill</span>
          </button>
        )}
      </motion.div>

      {/* ─── Curated High-Match Alternatives (Quiet Minimalist Row) ─── */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
              Alternative Matches
            </span>
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-stone-100 dark:bg-stone-800 text-[9px] font-mono text-stone-400">
              {recommendations.length}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono truncate max-w-[130px]">
            {targetCourseName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-2xl border border-stone-200/70 dark:border-stone-800/70 bg-white dark:bg-[#181a1c] p-3 flex flex-col justify-between space-y-2 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-stone-900 dark:text-white truncate">
                    {rec.shortName}
                  </span>
                  <span className="inline-flex items-center justify-center h-4 px-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-mono text-[9px] font-semibold">
                    ★ {rec.alumniRating}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 font-mono truncate">
                  {rec.state}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectUni(rec.id)}
                className="w-full py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[10px] font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-center cursor-pointer"
              >
                Select {rec.shortName}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
