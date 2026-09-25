'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CourseTrack } from '../../types';
import { playTapSound, playCorrectSound } from '../../utils/audio';
import { UNIVERSITIES_DIRECTORY, UniversityData } from '../../data/universitiesData';
import { CountUp } from '../Motion/CountUp';
import {
  Building2,
  GraduationCap,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  Flame,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Globe,
  Compass,
  FileText,
  Sliders,
  Share2,
  Clock,
  Radio,
  BookOpen,
} from 'lucide-react';

interface AdmissionsOracleViewProps {
  profile: UserProfile;
  onNavigateToDrill?: (subjectId: string) => void;
  onSelectCourseTrack?: (track: CourseTrack) => void;
}

type UniversityFilterType = 'All' | 'Federal' | 'State' | 'Private' | 'International';

type OLevelGrade = 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6';
const GRADE_POINTS: Record<OLevelGrade, number> = {
  A1: 8,
  B2: 7,
  B3: 6,
  C4: 5,
  C5: 4,
  C6: 3,
};

export const AdmissionsOracleView: React.FC<AdmissionsOracleViewProps> = ({
  profile,
  onNavigateToDrill,
}) => {
  const [activeTab, setActiveTab] = useState<UniversityFilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUniId, setExpandedUniId] = useState<string | null>('unilag');

  // Interactive O-Level grades state for aggregate calculator (5 core subjects)
  const [oLevelGrades, setOLevelGrades] = useState<{
    english: OLevelGrade;
    mathematics: OLevelGrade;
    subject3: OLevelGrade;
    subject4: OLevelGrade;
    subject5: OLevelGrade;
  }>({
    english: 'A1',
    mathematics: 'B2',
    subject3: 'A1',
    subject4: 'B3',
    subject5: 'B2',
  });

  // Calculate 5-subject O-Level total points (Max = 40)
  const oLevelTotalPoints = useMemo(() => {
    return (
      GRADE_POINTS[oLevelGrades.english] +
      GRADE_POINTS[oLevelGrades.mathematics] +
      GRADE_POINTS[oLevelGrades.subject3] +
      GRADE_POINTS[oLevelGrades.subject4] +
      GRADE_POINTS[oLevelGrades.subject5]
    );
  }, [oLevelGrades]);

  // UNILAG / Federal standard aggregate formula:
  // (UTME / 8) [Max 50%] + (O-Level Points / 40 * 20) [Max 20%] + (Post-UTME / 30) [Max 30%]
  // With simulated Post-UTME estimate based on candidate accuracy
  const simulatedPostUtmeScore = useMemo(() => {
    const accuracy = profile.accuracyRate || 75;
    return Math.round((accuracy / 100) * 30 * 10) / 10; // out of 30
  }, [profile.accuracyRate]);

  const candidateAggregate = useMemo(() => {
    const utmePart = (profile.currentEstimatedScore / 400) * 50; // out of 50
    const oLevelPart = (oLevelTotalPoints / 40) * 20; // out of 20
    const postUtmePart = simulatedPostUtmeScore; // out of 30
    return Math.round((utmePart + oLevelPart + postUtmePart) * 10) / 10;
  }, [profile.currentEstimatedScore, oLevelTotalPoints, simulatedPostUtmeScore]);

  // Filter universities by category & search query
  const filteredUniversities = useMemo(() => {
    return UNIVERSITIES_DIRECTORY.filter((uni) => {
      const matchesType = activeTab === 'All' || uni.type === activeTab;
      const matchesSearch =
        searchQuery.trim() === '' ||
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.popularCourses.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const toggleExpand = (id: string) => {
    playTapSound();
    setExpandedUniId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: UniversityData['status']) => {
    switch (status) {
      case 'Form Open':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Closing Soon':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse';
      case 'Screening Scheduled':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Admission List Out':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      default:
        return 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300';
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col px-3 sm:px-4 py-3 max-w-2xl mx-auto space-y-4 select-none pb-20">
      {/* ─── Real-Time Admission Bulletin Ticker ─── */}
      <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 p-3 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="text-[11px] text-emerald-900 dark:text-emerald-200 truncate">
            <strong className="font-semibold uppercase tracking-wider font-mono">Live Bulletin:</strong>{' '}
            2025/2026 Post-UTME Portals open across UNILAG, UI, OAU, LASU & Covenant. Direct links synced.
          </div>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 font-mono font-bold shrink-0">
          REAL-TIME
        </span>
      </div>

      {/* ─── Header & Aggregate Overview Card ─── */}
      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>University & Post-UTME Gateway</span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              Admissions Oracle & Portal Directory
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-mono text-stone-400">Target Track</span>
            <span className="text-xs font-semibold text-stone-900 dark:text-white truncate max-w-[140px]">
              {profile.courseTrack?.name || 'Medicine & Surgery'}
            </span>
          </div>
        </div>

        {/* Candidate Calculated Aggregate Stats */}
        <div className="grid grid-cols-3 gap-2.5 bg-stone-50 dark:bg-[#121314] p-3 rounded-2xl border border-stone-100 dark:border-stone-800/80">
          <div className="text-center">
            <span className="text-[10px] text-stone-400 uppercase font-mono block">UTME Score</span>
            <span className="font-serif text-lg font-bold text-stone-900 dark:text-white">
              <CountUp value={profile.currentEstimatedScore} />
              <span className="text-[11px] font-normal text-stone-400">/400</span>
            </span>
          </div>
          <div className="text-center border-x border-stone-200 dark:border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-mono block">O-Level Pts</span>
            <span className="font-serif text-lg font-bold text-stone-900 dark:text-white">
              {oLevelTotalPoints}
              <span className="text-[11px] font-normal text-stone-400">/40</span>
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-stone-400 uppercase font-mono block">Est. Aggregate</span>
            <span className="font-serif text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {candidateAggregate}%
            </span>
          </div>
        </div>
      </div>

      {/* ─── Category Filter Tabs & Search Bar ─── */}
      <div className="space-y-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['All', 'Federal', 'State', 'Private', 'International'] as UniversityFilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                playTapSound();
                setActiveTab(tab);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === tab
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {tab === 'Federal' && <Building2 className="w-3.5 h-3.5" />}
              {tab === 'State' && <GraduationCap className="w-3.5 h-3.5" />}
              {tab === 'Private' && <Sparkles className="w-3.5 h-3.5" />}
              {tab === 'International' && <Globe className="w-3.5 h-3.5" />}
              <span>{tab === 'All' ? 'All Institutions' : tab}</span>
              <span className="text-[10px] opacity-60 font-mono ml-0.5">
                (
                {
                  UNIVERSITIES_DIRECTORY.filter((u) => tab === 'All' || u.type === tab).length
                }
                )
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search universities, courses (e.g. Medicine, UNILAG, Covenant, A-Levels)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181a1c] text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 transition-all"
          />
        </div>
      </div>

      {/* ─── University Cards Directory ─── */}
      <div className="space-y-3">
        {filteredUniversities.map((uni) => {
          const isExpanded = expandedUniId === uni.id;
          const targetCourseName = profile.courseTrack?.name || 'Medicine & Surgery';
          const cutoffInfo = uni.courseCutoffs[targetCourseName] || Object.values(uni.courseCutoffs)[0];
          const isEligible =
            cutoffInfo &&
            profile.currentEstimatedScore >= (cutoffInfo.utmeMin || uni.generalCutOff) &&
            candidateAggregate >= (cutoffInfo.aggregate || 60);

          return (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-4 sm:p-5 shadow-2xs space-y-3 transition-all"
            >
              {/* Top Row: Name, Type & Real-time Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                      {uni.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold">
                      {uni.type}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-mono">
                    {uni.location} · {uni.state}
                  </p>
                </div>

                {/* Real-time Post-UTME Status Badge */}
                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                      uni.status
                    )}`}
                  >
                    ● {uni.status}
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono mt-0.5">
                    {uni.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Real-Time Status Detail Alert */}
              <div className="text-[11px] text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#121314] p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{uni.statusDetail}</span>
              </div>

              {/* Cut-off Metrics & Post-UTME Format */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="bg-stone-50/80 dark:bg-stone-900/40 p-2.5 rounded-xl">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">General Cut-Off</span>
                  <span className="font-serif font-bold text-stone-900 dark:text-white text-sm">
                    {uni.generalCutOff > 0 ? `${uni.generalCutOff}+ in UTME` : 'A-Level Points'}
                  </span>
                </div>

                <div className="bg-stone-50/80 dark:bg-stone-900/40 p-2.5 rounded-xl">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">Screening Format</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200 text-xs truncate block">
                    {uni.postUtmeFormat}
                  </span>
                </div>

                <div className="bg-stone-50/80 dark:bg-stone-900/40 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">Your Admission Pace</span>
                  <span
                    className={`font-semibold text-xs flex items-center gap-1 ${
                      isEligible
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {isEligible ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>High Probability</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        <span>Requires Drill Sprint</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Direct Official Portal Link + Post-UTME Practice */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={uni.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playTapSound()}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Official University Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </a>

                {onNavigateToDrill && (
                  <button
                    onClick={() => {
                      playTapSound();
                      onNavigateToDrill('all');
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Practice Post-UTME</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleExpand(uni.id)}
                  className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                  title="View Course Cut-Offs"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Collapsible Course Cut-off Benchmarks Drawer */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2 overflow-hidden text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-stone-900 dark:text-white pt-1">
                      <span>Official Departmental Cut-Offs</span>
                      <span className="text-[10px] text-stone-400 font-mono">UTME Min / Aggregate</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {Object.entries(uni.courseCutoffs).map(([course, cut]) => (
                        <div
                          key={course}
                          className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-[#121314] text-[11px]"
                        >
                          <span className="font-medium text-stone-700 dark:text-stone-300 truncate max-w-[170px]">
                            {course}
                          </span>
                          <span className="font-mono font-semibold text-stone-900 dark:text-white">
                            {cut.utmeMin > 0 ? `${cut.utmeMin} / ${cut.aggregate}%` : `${cut.aggregate} pts`}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-stone-400 leading-relaxed pt-1">
                      <strong>Screening Note:</strong> {uni.screeningRequirements}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredUniversities.length === 0 && (
          <div className="text-center py-12 text-xs text-stone-400">
            No universities found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
