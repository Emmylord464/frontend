'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Star,
  Flame,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Globe,
  Compass,
  Clock,
  Radio,
  BookOpen,
  ThumbsUp,
  Sliders,
  Layers,
} from 'lucide-react';

interface AdmissionsOracleViewProps {
  profile: UserProfile;
  onNavigateToDrill?: (subjectId: string) => void;
  onSelectCourseTrack?: (track: CourseTrack) => void;
}

type UniversityCategory = 'Federal' | 'State' | 'Private' | 'International';

export const AdmissionsOracleView: React.FC<AdmissionsOracleViewProps> = ({
  profile,
  onNavigateToDrill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUniId, setExpandedUniId] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<UniversityCategory | null>(null);

  // Followed universities state (saved to localStorage)
  const [followedIds, setFollowedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scholar_followed_universities');
      return saved ? JSON.parse(saved) : ['unilag', 'covenant', 'ui'];
    } catch {
      return ['unilag', 'covenant', 'ui'];
    }
  });

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    setFollowedIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('scholar_followed_universities', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const followedUniversities = useMemo(() => {
    return UNIVERSITIES_DIRECTORY.filter((uni) => followedIds.includes(uni.id));
  }, [followedIds]);

  // Alumni & Web Recommendations based on candidate's course track and score
  const recommendedUniversities = useMemo(() => {
    const course = profile.courseTrack?.name || 'Medicine & Surgery';
    return UNIVERSITIES_DIRECTORY.filter((uni) => {
      // Find universities offering the course or top tier rated
      return (
        uni.popularCourses.some((c) => c.toLowerCase().includes(course.toLowerCase())) ||
        uni.alumniRating >= 4.7
      );
    }).slice(0, 3);
  }, [profile.courseTrack?.name]);

  const toggleCategory = (cat: UniversityCategory) => {
    playTapSound();
    setExpandedCategory((prev) => (prev === cat ? null : cat));
  };

  const toggleExpandUni = (id: string) => {
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

  // Search filtered results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return UNIVERSITIES_DIRECTORY.filter(
      (uni) =>
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.popularCourses.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

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
          LIVE
        </span>
      </div>

      {/* ─── Header Card ─── */}
      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>University & Post-UTME Gateway</span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              Admissions Portal & Recommendations
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-mono text-stone-400">Target Track</span>
            <span className="text-xs font-semibold text-stone-900 dark:text-white truncate max-w-[140px]">
              {profile.courseTrack?.name || 'Medicine & Surgery'}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative pt-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 100+ universities, courses, or states..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#121314] text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 transition-all"
          />
        </div>
      </div>

      {/* ─── Search Results (when searching) ─── */}
      {searchResults && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-stone-400 font-mono px-1">
            <span>Search Results ({searchResults.length})</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-stone-600 dark:text-stone-300 hover:underline"
            >
              Clear Search
            </button>
          </div>

          <div className="space-y-2.5">
            {searchResults.map((uni) => (
              <UniversityCard
                key={uni.id}
                uni={uni}
                isFollowed={followedIds.includes(uni.id)}
                isExpanded={expandedUniId === uni.id}
                onToggleFollow={(e) => toggleFollow(uni.id, e)}
                onToggleExpand={() => toggleExpandUni(uni.id)}
                onNavigateToDrill={onNavigateToDrill}
                getStatusBadge={getStatusBadge}
              />
            ))}
            {searchResults.length === 0 && (
              <div className="text-center py-8 text-xs text-stone-400">
                No universities matched "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

      {!searchResults && (
        <>
          {/* ─── 1. Candidate's Followed Universities (Watchlist) ─── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-white uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>My Followed Universities ({followedUniversities.length})</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">Real-time Watchlist</span>
            </div>

            <div className="space-y-2.5">
              {followedUniversities.map((uni) => (
                <UniversityCard
                  key={uni.id}
                  uni={uni}
                  isFollowed={true}
                  isExpanded={expandedUniId === uni.id}
                  onToggleFollow={(e) => toggleFollow(uni.id, e)}
                  onToggleExpand={() => toggleExpandUni(uni.id)}
                  onNavigateToDrill={onNavigateToDrill}
                  getStatusBadge={getStatusBadge}
                />
              ))}

              {followedUniversities.length === 0 && (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#181a1c] border border-dashed border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">
                  Star any university from the categories below to pin it to your real-time watchlist.
                </div>
              )}
            </div>
          </div>

          {/* ─── 2. Alumni & Course Recommendation Radar ─── */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-white uppercase tracking-wider">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alumni & Course Match Recommendations</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">Web & Alumni Reports</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {recommendedUniversities.map((uni, idx) => (
                <div
                  key={uni.id}
                  className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-3.5 flex flex-col justify-between space-y-2 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-mono font-bold">
                        ★ {uni.alumniRating} / 5.0
                      </span>
                      <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {uni.employabilityScore}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">
                      {uni.shortName}
                    </h4>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {uni.alumniReport}
                    </p>
                  </div>

                  <a
                    href={uni.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playTapSound()}
                    className="w-full py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[10px] font-semibold flex items-center justify-center gap-1 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* ─── 3. Collapsible 100+ University Category Accordions ─── */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-stone-900 dark:text-white uppercase tracking-wider">
                Explore Full Directory (100+ Institutions)
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Tap category to expand</span>
            </div>

            {(['Federal', 'State', 'Private', 'International'] as UniversityCategory[]).map((category) => {
              const isOpen = expandedCategory === category;
              const categoryUnis = UNIVERSITIES_DIRECTORY.filter((u) => u.type === category);

              return (
                <div
                  key={category}
                  className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] overflow-hidden shadow-2xs"
                >
                  {/* Category Header Accordion Button */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                        {category === 'Federal' && <Building2 className="w-4 h-4" />}
                        {category === 'State' && <GraduationCap className="w-4 h-4" />}
                        {category === 'Private' && <Sparkles className="w-4 h-4" />}
                        {category === 'International' && <Globe className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-bold text-stone-900 dark:text-white">
                          {category === 'Federal' && '🏛️ Federal Universities (52+)'}
                          {category === 'State' && '🏢 State Universities (63+)'}
                          {category === 'Private' && '🏰 Private Universities (147+)'}
                          {category === 'International' && '🌍 International & Direct Entry (JUPEB, A-Levels, SAT)'}
                        </h3>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {categoryUnis.length} verified portals & cut-offs
                        </span>
                      </div>
                    </div>

                    <div className="p-1 rounded-lg text-stone-400">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded Accordion List of Universities */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 border-t border-stone-100 dark:border-stone-800 space-y-2.5 bg-stone-50/50 dark:bg-[#141517]/40"
                      >
                        {categoryUnis.map((uni) => (
                          <UniversityCard
                            key={uni.id}
                            uni={uni}
                            isFollowed={followedIds.includes(uni.id)}
                            isExpanded={expandedUniId === uni.id}
                            onToggleFollow={(e) => toggleFollow(uni.id, e)}
                            onToggleExpand={() => toggleExpandUni(uni.id)}
                            onNavigateToDrill={onNavigateToDrill}
                            getStatusBadge={getStatusBadge}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Reusable Compact University Card Component ──────────────────────────────
interface UniversityCardProps {
  uni: UniversityData;
  isFollowed: boolean;
  isExpanded: boolean;
  onToggleFollow: (e: React.MouseEvent) => void;
  onToggleExpand: () => void;
  onNavigateToDrill?: (subjectId: string) => void;
  getStatusBadge: (status: UniversityData['status']) => string;
}

const UniversityCard: React.FC<UniversityCardProps> = ({
  uni,
  isFollowed,
  isExpanded,
  onToggleFollow,
  onToggleExpand,
  onNavigateToDrill,
  getStatusBadge,
}) => {
  return (
    <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#181a1c] p-3.5 sm:p-4 shadow-2xs space-y-2.5 transition-all">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-serif text-sm sm:text-base font-bold text-stone-900 dark:text-white">
              {uni.name}
            </h4>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold">
              {uni.type}
            </span>
            <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
              ★ {uni.alumniRating}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono">
            {uni.location} · {uni.state} · <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{uni.employabilityScore}</span>
          </p>
        </div>

        {/* Follow Star + Real-time Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleFollow}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isFollowed
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-600'
                : 'border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-800 dark:hover:text-white'
            }`}
            title={isFollowed ? 'Unfollow university' : 'Follow university to watchlist'}
          >
            <Star className={`w-3.5 h-3.5 ${isFollowed ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${getStatusBadge(
              uni.status
            )}`}
          >
            ● {uni.status}
          </span>
        </div>
      </div>

      {/* Alumni Report & Status Detail */}
      <div className="text-[11px] text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#121314] p-2 rounded-xl border border-stone-100 dark:border-stone-800 flex items-start gap-2">
        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{uni.statusDetail}</span>
      </div>

      {/* Action Buttons: Direct Official Portal Link + Post-UTME Practice */}
      <div className="flex items-center gap-2 pt-0.5">
        <a
          href={uni.portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playTapSound()}
          className="flex-1 py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Official Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
        </a>

        {onNavigateToDrill && (
          <button
            onClick={() => {
              playTapSound();
              onNavigateToDrill('all');
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice Post-UTME</span>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleExpand}
          className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
          title="View Cut-Offs & Alumni Report"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
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
            <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
              <strong>Alumni & Web Report:</strong> {uni.alumniReport}
            </div>

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
    </div>
  );
};
