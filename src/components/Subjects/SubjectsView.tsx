'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Subject, SubjectCategory, Department } from '../../types';
import { playTapSound } from '../../utils/audio';
import {
  Search,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  TrendingUp,
  Landmark,
  Scroll,
  Globe,
  Wheat,
  Receipt,
  Church,
  ArrowRight,
  Flame,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface SubjectsViewProps {
  subjects: Subject[];
  userDepartment?: Department;
  englishUnlocked?: boolean;
  dailyGoal?: number;
  dailyProgressBySubject?: Record<string, number>;
  onSelectSubject: (subjectId: string) => void;
  onUpdateDepartment?: (department: Department) => void;
  onUnlockEnglish?: () => void;
  onUpdateDailyGoal?: (goal: number) => void;
}

const CATEGORY_TABS: { id: SubjectCategory | 'All'; label: string }[] = [
  { id: 'All', label: 'All Subjects' },
  { id: 'Sciences', label: 'Sciences' },
  { id: 'Commercial', label: 'Commercial' },
  { id: 'Arts', label: 'Arts & Humanities' },
];

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  TrendingUp,
  Landmark,
  Scroll,
  Globe,
  Wheat,
  Receipt,
  Church,
};

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onSelectSubject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    playTapSound();
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [subjects, selectedCategory, searchQuery]);

  // Group by category for collapsible accordions
  const groupedSubjects = useMemo(() => {
    const groups: Record<string, Subject[]> = {};
    filteredSubjects.forEach((sub) => {
      const cat = sub.category || 'Sciences';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(sub);
    });
    return groups;
  }, [filteredSubjects]);

  return (
    <div className="w-full flex-1 flex flex-col px-3 sm:px-4 py-3 space-y-3 max-w-lg mx-auto">
      {/* Top Search & Filter Bar (Compact) */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 19 UTME subjects..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181a1c] text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                setSelectedCategory(tab.id);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedCategory === tab.id
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-[#181a1c] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible Subject Groups */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pb-20">
        {Object.entries(groupedSubjects).map(([category, subs]) => {
          const isCollapsed = collapsedCategories[category] ?? false;

          return (
            <div
              key={category}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181a1c] overflow-hidden shadow-xs"
            >
              {/* Collapsible Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-2.5 flex items-center justify-between bg-stone-50/70 dark:bg-[#1f2224] hover:bg-stone-100/80 dark:hover:bg-[#25282b] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200">
                    {category}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
                    {subs.length}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
                    isCollapsed ? '-rotate-90' : 'rotate-0'
                  }`}
                />
              </button>

              {/* Subject Items (Compact 2-column or 1-column grid) */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5"
                  >
                    {subs.map((subject) => {
                      const iconKey = (subject as any).icon || 'BookOpen';
                      const Icon = ICON_MAP[iconKey] || BookOpen;
                      const isEnglish = subject.id === 'english';

                      return (
                        <button
                          key={subject.id}
                          onClick={() => {
                            playTapSound();
                            onSelectSubject(subject.id);
                          }}
                          className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center justify-between gap-2 group select-none ${
                            isEnglish
                              ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                              : 'border-stone-100 dark:border-stone-800/80 bg-white dark:bg-[#181a1c] hover:border-stone-300 dark:hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isEnglish
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                                  {subject.name}
                                </span>
                                {isEnglish && (
                                  <span className="text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-1 rounded">
                                    Compulsory
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {subject.readiness}% Readiness
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors shrink-0">
                            <span>Drill</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredSubjects.length === 0 && (
          <div className="text-center py-8 text-xs text-stone-400">
            No subjects matched "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
