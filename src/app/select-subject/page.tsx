'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
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
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { playTapSound } from '@/utils/audio';

interface SubjectItem {
  id: string;
  name: string;
  category: 'Science' | 'Commercial' | 'Arts' | 'Languages';
  isCompulsory?: boolean;
  topicSample: string;
  cardCount: number;
}

const ALL_19_SUBJECTS: SubjectItem[] = [
  {
    id: 'use_of_english',
    name: 'Use of English',
    category: 'Arts',
    isCompulsory: true,
    topicSample: 'Concord, Lexis, The Lekki Headmaster',
    cardCount: 20,
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    category: 'Science',
    topicSample: 'Trigonometry, Calculus, Matrices',
    cardCount: 20,
  },
  {
    id: 'physics',
    name: 'Physics',
    category: 'Science',
    topicSample: 'Mechanics, Projectiles, Wave Optics',
    cardCount: 20,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'Science',
    topicSample: 'Organic Reactions, Gas Laws, Electrolysis',
    cardCount: 15,
  },
  {
    id: 'biology',
    name: 'Biology',
    category: 'Science',
    topicSample: 'Genetics, Cell Biology, Ecology',
    cardCount: 20,
  },
  {
    id: 'economics',
    name: 'Economics',
    category: 'Commercial',
    topicSample: 'Market Elasticity, National Income, Fiscal Policy',
    cardCount: 15,
  },
  {
    id: 'government',
    name: 'Government',
    category: 'Arts',
    topicSample: 'Constitutional Development, Electoral Systems',
    cardCount: 15,
  },
  {
    id: 'literature_in_english',
    name: 'Literature-in-English',
    category: 'Arts',
    topicSample: 'Poetry Analysis, Drama, Prose Appreciation',
    cardCount: 12,
  },
  {
    id: 'commerce',
    name: 'Commerce',
    category: 'Commercial',
    topicSample: 'Trade Documents, Banking, Stock Exchange',
    cardCount: 12,
  },
  {
    id: 'accounting',
    name: 'Principles of Accounts',
    category: 'Commercial',
    topicSample: 'Ledger Balancing, Trial Balance, Depreciation',
    cardCount: 12,
  },
  {
    id: 'crk',
    name: 'Christian Religious Knowledge',
    category: 'Arts',
    topicSample: 'Early Church, Epistles, Gospel Narratives',
    cardCount: 10,
  },
  {
    id: 'irs',
    name: 'Islamic Religious Studies',
    category: 'Arts',
    topicSample: 'Tafsir, Hadith Science, Islamic Law',
    cardCount: 10,
  },
  {
    id: 'geography',
    name: 'Geography',
    category: 'Science',
    topicSample: 'Map Reading, Climatology, Settlement Geography',
    cardCount: 10,
  },
  {
    id: 'agricultural_science',
    name: 'Agricultural Science',
    category: 'Science',
    topicSample: 'Soil Fertility, Animal Husbandry, Farm Power',
    cardCount: 10,
  },
  {
    id: 'history',
    name: 'History',
    category: 'Arts',
    topicSample: 'Pre-Colonial Kingdoms, Nationalism, Pan-Africanism',
    cardCount: 10,
  },
  {
    id: 'civic_education',
    name: 'Civic Education',
    category: 'Arts',
    topicSample: 'Human Rights, Rule of Law, Democratic Values',
    cardCount: 10,
  },
  {
    id: 'hausa',
    name: 'Hausa',
    category: 'Languages',
    topicSample: 'Harshe, Adabi da Al’adu',
    cardCount: 8,
  },
  {
    id: 'igbo',
    name: 'Igbo',
    category: 'Languages',
    topicSample: 'Utoasusu, Agumagu na Omenala',
    cardCount: 8,
  },
  {
    id: 'yoruba',
    name: 'Yoruba',
    category: 'Languages',
    topicSample: 'Ede, Litireso ati Asa',
    cardCount: 8,
  },
  {
    id: 'french',
    name: 'French',
    category: 'Languages',
    topicSample: 'Grammaire, Vocabulaire, Expression Écrite',
    cardCount: 8,
  },
];

type FilterCategory = 'All' | 'Science' | 'Commercial' | 'Arts';

export default function SelectSubjectPage() {
  const router = useRouter();
  const { setSubject, streakCount, targetCourse, targetScore } = useWorkoutStore();
  const [activeTab, setActiveTab] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = ALL_19_SUBJECTS.filter((sub) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Science'
        ? sub.category === 'Science'
        : activeTab === 'Commercial'
        ? sub.category === 'Commercial'
        : sub.category === 'Arts' || sub.category === 'Languages';

    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.topicSample.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleSelect = (subjectId: string) => {
    playTapSound();
    setSubject(subjectId);
    router.push('/workout');
  };

  return (
    <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] text-[#1a1c1c] dark:text-[#f3f4f6] flex flex-col antialiased">
      {/* Header */}
      <header className="border-b border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8]/90 dark:bg-[#121314]/90 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c] dark:hover:text-white transition-colors font-ui"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Profile</span>
          </Link>

          <span className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
            Select Subject
          </span>

          <div className="flex items-center gap-1 text-xs font-semibold text-[#c2410c] font-ui">
            <Flame className="w-3.5 h-3.5 fill-[#c2410c]/20" />
            <span>{streakCount}d</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4 space-y-4 font-ui">
        {/* User Target Cardlet */}
        <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-[#181a1c] p-3.5 border border-[#e5e5e3] dark:border-[#282b2e] shadow-2xs text-xs">
          <div>
            <span className="text-[#747878] dark:text-[#9ca3af]">Target Faculty:</span>
            <p className="font-semibold text-[#1a1c1c] dark:text-white">{targetCourse}</p>
          </div>
          <div className="text-right">
            <span className="text-[#747878] dark:text-[#9ca3af]">Goal:</span>
            <p className="font-bold text-[#c2410c]">{targetScore}+</p>
          </div>
        </div>

        {/* COMPULSORY USE OF ENGLISH HIGHLIGHT CARD */}
        {activeTab === 'All' || activeTab === 'Arts' ? (
          <motion.div
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelect('use_of_english')}
            className="cursor-pointer rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Compulsory (100% Candidates)
                </span>
              </div>
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
                Start Drill <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <h3 className="font-editorial text-xl font-bold text-emerald-950 dark:text-emerald-100">
              Use of English
            </h3>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
              Concord Rules (Dele Ashade), The Lekki Headmaster novel logs, Lexis & Structure.
            </p>
          </motion.div>
        ) : null}

        {/* Category Tabs */}
        <div className="flex gap-1.5 border-b border-[#e5e5e3] dark:border-[#282b2e] pb-2 overflow-x-auto no-scrollbar">
          {(['All', 'Science', 'Commercial', 'Arts'] as FilterCategory[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#1a1c1c] text-white dark:bg-white dark:text-[#121314]'
                  : 'bg-[#f3f4f3] dark:bg-[#1a1c1e] text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c]'
              }`}
            >
              {tab === 'All' ? 'All 19 Subjects' : tab}
            </button>
          ))}
        </div>

        {/* 19 Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredSubjects
            .filter((sub) => sub.id !== 'use_of_english' || activeTab !== 'All')
            .map((subject) => (
              <motion.button
                key={subject.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(subject.id)}
                className="text-left rounded-2xl border border-[#e5e5e3] dark:border-[#282b2e] bg-white dark:bg-[#181a1c] p-4 shadow-2xs hover:border-[#1a1c1c]/40 dark:hover:border-white/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#747878] dark:text-[#9ca3af] uppercase tracking-wider mb-1">
                    <span>{subject.category}</span>
                    <span>{subject.cardCount} Cards</span>
                  </div>
                  <h4 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white leading-snug">
                    {subject.name}
                  </h4>
                  <p className="text-[11px] text-[#747878] dark:text-[#9ca3af] line-clamp-1 mt-0.5">
                    {subject.topicSample}
                  </p>
                </div>
                <div className="flex items-center justify-end text-xs text-[#c2410c] font-semibold mt-3">
                  <span>Practice →</span>
                </div>
              </motion.button>
            ))}
        </div>
      </main>
    </div>
  );
}
