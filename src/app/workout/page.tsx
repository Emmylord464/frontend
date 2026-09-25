'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flame, Sparkles } from 'lucide-react';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { FlashcardPlayer } from '@/components/FlashcardPlayer';
import { INITIAL_DECKS } from '@/lib/constants/initial-decks';

const SUBJECT_NAMES: Record<string, string> = {
  use_of_english: 'Use of English',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  economics: 'Economics',
  government: 'Government',
  literature_in_english: 'Literature-in-English',
  commerce: 'Commerce',
  accounting: 'Principles of Accounts',
  crk: 'Christian Religious Knowledge',
  irs: 'Islamic Religious Studies',
  geography: 'Geography',
  agricultural_science: 'Agricultural Science',
  history: 'History',
  civic_education: 'Civic Education',
  hausa: 'Hausa',
  igbo: 'Igbo',
  yoruba: 'Yoruba',
  french: 'French',
};

export default function WorkoutPage() {
  const router = useRouter();
  const {
    selectedSubject,
    deck,
    currentIndex,
    recordAttempt,
    nextCard,
    finishWorkout,
    streakCount,
    loadDeck,
  } = useWorkoutStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!deck || deck.length === 0) {
      loadDeck(selectedSubject || 'use_of_english');
    }
  }, [deck, selectedSubject, loadDeck]);

  const handleRecordResult = (params: {
    flashcardId: string;
    topicSlug: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
    selectedOption?: string;
  }) => {
    recordAttempt(params);
  };

  const handleFinish = () => {
    finishWorkout();
    router.push('/analytics');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] flex items-center justify-center">
        <div className="animate-pulse text-sm text-[#747878] dark:text-[#9ca3af]">
          Loading 5-Card Micro-Drill…
        </div>
      </div>
    );
  }

  const activeDeck = deck && deck.length > 0 ? deck : INITIAL_DECKS['use_of_english'];
  const subjectName = SUBJECT_NAMES[selectedSubject] || 'Use of English';

  return (
    <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] text-[#1a1c1c] dark:text-[#f3f4f6] flex flex-col antialiased">
      {/* Top Header */}
      <header className="border-b border-[#e5e5e3] dark:border-[#282b2e] bg-[#f9f9f8]/90 dark:bg-[#121314]/90 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            href="/select-subject"
            className="flex items-center gap-1.5 text-xs text-[#747878] dark:text-[#9ca3af] hover:text-[#1a1c1c] dark:hover:text-white transition-colors font-ui"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Subjects</span>
          </Link>

          <span className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white">
            5-Card Workout
          </span>

          <div className="flex items-center gap-1 text-xs font-semibold text-[#c2410c] font-ui">
            <Flame className="w-3.5 h-3.5 fill-[#c2410c]/20" />
            <span>{streakCount}d</span>
          </div>
        </div>
      </header>

      {/* Main Flashcard Player Container */}
      <main className="flex-1 flex flex-col justify-center py-2">
        <FlashcardPlayer
          cards={activeDeck}
          currentIndex={currentIndex}
          onRecordResult={handleRecordResult}
          onNextCard={nextCard}
          onFinishWorkout={handleFinish}
          subjectTitle={subjectName}
        />
      </main>
    </div>
  );
}
