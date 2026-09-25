'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CourseTrack } from '../../types';
import { playTapSound } from '../../utils/audio';
import {
  UNIVERSITIES_DIRECTORY,
  UniversityData,
  UniversityCourseOffering,
  getCoursesForUniversity,
} from '../../data/universitiesData';
import {
  ExternalLink,
  ChevronDown,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Layers,
  Search,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface AdmissionsOracleViewProps {
  profile: UserProfile;
  onNavigateToDrill?: (subjectId: string) => void;
  onSelectCourseTrack?: (track: CourseTrack) => void;
}

const PRESET_SCORES = [280, 300, 320, 340, 360];

const FACULTY_FILTERS = [
  'All Faculties',
  'Health Sciences',
  'Engineering',
  'Computing',
  'Law & Arts',
  'Management & Social',
  'Sciences',
] as const;

export const AdmissionsOracleView: React.FC<AdmissionsOracleViewProps> = ({
  profile,
  onNavigateToDrill,
  onSelectCourseTrack,
}) => {
  // Selected University Choice (Default: UNILAG)
  const [selectedUniId, setSelectedUniId] = useState<string>('unilag');
  const [targetScore, setTargetScore] = useState<number>(profile.targetScore || 320);
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState<boolean>(false);
  const [uniSearchQuery, setUniSearchQuery] = useState<string>('');
  
  // Selected Faculty Filter & Course State
  const [selectedFaculty, setSelectedFaculty] = useState<string>('All Faculties');
  const [selectedCourseName, setSelectedCourseName] = useState<string>(
    profile.courseTrack?.name || 'Medicine & Surgery'
  );
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>('');

  const selectedUni = useMemo(() => {
    return UNIVERSITIES_DIRECTORY.find((u) => u.id === selectedUniId) || UNIVERSITIES_DIRECTORY[0];
  }, [selectedUniId]);

  // Dynamically load all accredited courses for the selected university
  const availableCourses = useMemo(() => {
    return getCoursesForUniversity(selectedUni);
  }, [selectedUni]);

  // Ensure selectedCourseName is valid for current university; fallback to first course
  useEffect(() => {
    if (!availableCourses.some((c) => c.name.toLowerCase() === selectedCourseName.toLowerCase())) {
      if (availableCourses.length > 0) {
        setSelectedCourseName(availableCourses[0].name);
      }
    }
  }, [availableCourses, selectedCourseName]);

  // Active Selected Course Offering
  const activeCourse = useMemo(() => {
    return (
      availableCourses.find((c) => c.name.toLowerCase() === selectedCourseName.toLowerCase()) ||
      availableCourses[0]
    );
  }, [availableCourses, selectedCourseName]);

  // Filtered Course list by Faculty and Search Query
  const filteredCourses = useMemo(() => {
    return availableCourses.filter((c) => {
      const matchFaculty =
        selectedFaculty === 'All Faculties' || c.faculty === selectedFaculty;
      const matchSearch =
        !courseSearchQuery.trim() ||
        c.name.toLowerCase().includes(courseSearchQuery.toLowerCase());
      return matchFaculty && matchSearch;
    });
  }, [availableCourses, selectedFaculty, courseSearchQuery]);

  // Deficit / Surplus calculation
  const scoreDiff = (profile.currentEstimatedScore || 294) - activeCourse.utmeMin;
  const isCompetitive = scoreDiff >= 0;

  // 2 Curated Alternative University Recommendations offering the same course
  const recommendations = useMemo(() => {
    return UNIVERSITIES_DIRECTORY.filter(
      (u) =>
        u.id !== selectedUni.id &&
        (u.courseCutoffs[activeCourse.name] !== undefined ||
          u.popularCourses.some((c) => c.toLowerCase().includes(activeCourse.name.toLowerCase())))
    ).slice(0, 2);
  }, [selectedUni.id, activeCourse.name]);

  // University Dropdown list filtering
  const filteredUniList = useMemo(() => {
    if (!uniSearchQuery.trim()) return UNIVERSITIES_DIRECTORY;
    return UNIVERSITIES_DIRECTORY.filter(
      (u) =>
        u.name.toLowerCase().includes(uniSearchQuery.toLowerCase()) ||
        u.shortName.toLowerCase().includes(uniSearchQuery.toLowerCase()) ||
        u.state.toLowerCase().includes(uniSearchQuery.toLowerCase())
    );
  }, [uniSearchQuery]);

  const handleSelectUni = (id: string) => {
    playTapSound();
    setSelectedUniId(id);
    setIsUniDropdownOpen(false);
    setUniSearchQuery('');
  };

  const handleSelectCourse = (course: UniversityCourseOffering) => {
    playTapSound();
    setSelectedCourseName(course.name);

    if (onSelectCourseTrack) {
      onSelectCourseTrack({
        id: course.name.toLowerCase().replace(/\s+/g, '-'),
        name: course.name,
        faculty: course.faculty,
        targetCutoff: course.utmeMin,
        competitiveness: course.competitiveness === 'Extremely High' ? 'Very High' : course.competitiveness === 'High' ? 'High' : 'Moderate',
        requiredSubjects: course.requiredSubjectNames,
      });
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col px-3.5 sm:px-5 py-3 max-w-lg mx-auto space-y-3.5 select-none pb-24 text-stone-900 dark:text-stone-100">
      {/* ─── Ultra-Clean Header with Round Pill Badges ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
            Admissions Oracle
          </h1>
          <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-mono text-stone-600 dark:text-stone-300 font-semibold border border-stone-200/60 dark:border-stone-700/60">
            UTME '25
          </span>
        </div>

        <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-semibold border border-amber-200/60 dark:border-amber-800/60">
          ● {selectedUni.status}
        </span>
      </div>

      {/* ─── University Selector Dropdown ─── */}
      <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#181a1c] p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
          <span>Target Institution</span>
          <span>{UNIVERSITIES_DIRECTORY.length}+ Listed</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setIsUniDropdownOpen((prev) => !prev);
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
                isUniDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Searchable Dropdown Menu */}
          <AnimatePresence>
            {isUniDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1e20] shadow-xl p-2 space-y-1 max-h-64 overflow-y-auto"
              >
                <input
                  type="text"
                  value={uniSearchQuery}
                  onChange={(e) => setUniSearchQuery(e.target.value)}
                  placeholder="Search 100+ universities..."
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-[#141517] text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden mb-1"
                  autoFocus
                />

                <div className="space-y-0.5">
                  {filteredUniList.map((uni) => (
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
      </div>

      {/* ─── Interactive Accredited Courses Section (Connected to Selected Uni) ─── */}
      <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-2.5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
              Courses Offered at {selectedUni.shortName}
            </span>
            <h3 className="font-serif text-base font-bold text-stone-900 dark:text-white leading-tight">
              Select Your Intended Major
            </h3>
          </div>
          <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-[9px] font-bold border border-emerald-200/60 dark:border-emerald-800/60">
            {availableCourses.length} Programs
          </span>
        </div>

        {/* Faculty Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {FACULTY_FILTERS.map((faculty) => (
            <button
              key={faculty}
              onClick={() => {
                playTapSound();
                setSelectedFaculty(faculty);
              }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFaculty === faculty
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {faculty}
            </button>
          ))}
        </div>

        {/* Search Input for Courses */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={courseSearchQuery}
            onChange={(e) => setCourseSearchQuery(e.target.value)}
            placeholder={`Search ${selectedUni.shortName} courses...`}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#121314] border border-stone-200/70 dark:border-stone-800 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden"
          />
        </div>

        {/* Dynamic Selectable Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5 no-scrollbar">
          {filteredCourses.map((course) => {
            const isSelected = selectedCourseName.toLowerCase() === course.name.toLowerCase();

            return (
              <button
                key={course.name}
                type="button"
                onClick={() => handleSelectCourse(course)}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'border-stone-200/70 dark:border-stone-800/80 bg-stone-50/60 dark:bg-[#121314] hover:border-stone-400 dark:hover:border-stone-600'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="truncate">
                    <span className="font-serif font-bold text-xs text-stone-900 dark:text-white block truncate">
                      {course.name}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400 truncate block">
                      {course.faculty}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex h-4 w-4 rounded-full bg-emerald-600 text-white items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-stone-200/50 dark:border-stone-800/50">
                  <span className="text-stone-500 dark:text-stone-400">UTME Min:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {course.utmeMin > 0 ? `${course.utmeMin}+` : `${course.aggregate} pts`}
                  </span>
                </div>
              </button>
            );
          })}

          {filteredCourses.length === 0 && (
            <div className="col-span-2 text-center py-6 text-xs text-stone-400 font-mono">
              No courses matching "{courseSearchQuery}" in {selectedFaculty}.
            </div>
          )}
        </div>
      </div>

      {/* ─── Course Admission Blueprint & Cutoff Card ─── */}
      <motion.div
        key={`${selectedUni.id}-${activeCourse.name}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-4 sm:p-5 shadow-2xs space-y-3.5"
      >
        {/* Card Header & Circular Metric Badges */}
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

        {/* Selected Program Title & Career Vector */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#c2410c] font-bold block">
            Target Program
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-white leading-tight">
            {activeCourse.name}
          </h2>
          <p className="text-[11px] font-mono text-stone-400 mt-0.5">
            {activeCourse.careerPath}
          </p>
        </div>

        {/* 3 Core Minimal Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-stone-50 dark:bg-[#121314] p-2.5 rounded-2xl border border-stone-100 dark:border-stone-800/80 text-center">
          <div>
            <span className="text-[9px] uppercase font-mono text-stone-400 block">Cutoff</span>
            <span className="font-serif text-sm sm:text-base font-bold text-stone-900 dark:text-white">
              {activeCourse.utmeMin > 0 ? `${activeCourse.utmeMin}+` : `${activeCourse.aggregate} pts`}
            </span>
          </div>

          <div className="border-x border-stone-200 dark:border-stone-800">
            <span className="text-[9px] uppercase font-mono text-stone-400 block">Aggregate</span>
            <span className="font-serif text-sm sm:text-base font-bold text-stone-900 dark:text-white">
              {activeCourse.aggregate}%
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

        {/* 4 Compulsory UTME Subject Combination with 1-Tap Drill Triggers */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 px-0.5">
            <span>Required UTME Subject Combination</span>
            <span>4 Subjects</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {activeCourse.requiredSubjectNames.map((subjName, idx) => {
              const subjId = activeCourse.requiredSubjectIds[idx] || 'english';

              return (
                <button
                  key={subjName}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    if (onNavigateToDrill) onNavigateToDrill(subjId);
                  }}
                  className="p-2 rounded-xl bg-stone-50 dark:bg-[#121314] border border-stone-100 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="truncate">
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block truncate">
                      {subjName}
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">
                      50Q UTME Standard
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button: 1-Tap Post-UTME Practice */}
        {onNavigateToDrill && (
          <button
            onClick={() => {
              playTapSound();
              onNavigateToDrill(activeCourse.requiredSubjectIds[0] || 'all');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice {selectedUni.shortName} Post-UTME Drill</span>
          </button>
        )}
      </motion.div>

      {/* ─── Curated High-Match Alternatives for Selected Course ─── */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
              Alternative Matches for {activeCourse.name}
            </span>
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-stone-100 dark:bg-stone-800 text-[9px] font-mono text-stone-400">
              {recommendations.length}
            </span>
          </div>
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
