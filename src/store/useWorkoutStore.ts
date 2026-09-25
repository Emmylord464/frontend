import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Flashcard } from '@/lib/constants/initial-decks';
import { INITIAL_DECKS } from '@/lib/constants/initial-decks';

export interface CardAttempt {
  flashcardId: string;
  topicSlug: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  selectedOption?: string;
}

export interface WorkoutSessionSummary {
  subject: string;
  totalCards: number;
  correctCards: number;
  accuracyPercentage: number;
  averageSpeedSeconds: number;
  totalTimeSeconds: number;
  attempts: CardAttempt[];
  strengths: string[];
  weaknesses: string[];
  calculatedScoreProbability: number;
}

interface WorkoutState {
  // User Profile
  name: string;
  email: string;
  targetCourse: string;
  targetScore: number;
  streakCount: number;
  lastActiveDate: string | null;

  // Selected Subject & Active Deck
  selectedSubject: string;
  deck: Flashcard[];
  currentIndex: number;

  // Active Session Attempts
  sessionAttempts: CardAttempt[];
  lastSessionSummary: WorkoutSessionSummary | null;

  // Actions
  setProfile: (profile: { name?: string; email?: string; targetCourse?: string; targetScore?: number }) => void;
  incrementStreak: () => void;
  setSubject: (subject: string) => void;
  loadDeck: (subject: string, customCards?: Flashcard[]) => void;
  recordAttempt: (attempt: CardAttempt) => void;
  nextCard: () => void;
  finishWorkout: () => WorkoutSessionSummary;
  resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      name: 'Scholar Candidate',
      email: 'candidate@scholar.edu.ng',
      targetCourse: 'Medicine & Surgery',
      targetScore: 280,
      streakCount: 3,
      lastActiveDate: null,

      selectedSubject: 'use_of_english',
      deck: INITIAL_DECKS['use_of_english'] || [],
      currentIndex: 0,
      sessionAttempts: [],
      lastSessionSummary: null,

      setProfile: (profile) =>
        set((state) => ({
          ...state,
          ...profile,
        })),

      incrementStreak: () => {
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = get().lastActiveDate;
        if (lastDate !== today) {
          set((state) => ({
            streakCount: state.streakCount + 1,
            lastActiveDate: today,
          }));
        }
      },

      setSubject: (subject: string) => {
        const availableDeck = INITIAL_DECKS[subject] || INITIAL_DECKS['use_of_english'] || [];
        set({
          selectedSubject: subject,
          deck: availableDeck,
          currentIndex: 0,
          sessionAttempts: [],
        });
      },

      loadDeck: (subject: string, customCards?: Flashcard[]) => {
        const activeCards = customCards && customCards.length > 0
          ? customCards
          : INITIAL_DECKS[subject] || INITIAL_DECKS['use_of_english'] || [];
        set({
          selectedSubject: subject,
          deck: activeCards,
          currentIndex: 0,
          sessionAttempts: [],
        });
      },

      recordAttempt: (attempt: CardAttempt) => {
        set((state) => ({
          sessionAttempts: [...state.sessionAttempts, attempt],
        }));
      },

      nextCard: () => {
        set((state) => ({
          currentIndex: Math.min(state.deck.length, state.currentIndex + 1),
        }));
      },

      finishWorkout: () => {
        const { selectedSubject, deck, sessionAttempts, targetScore } = get();
        const totalCards = sessionAttempts.length || deck.length || 5;
        const correctCards = sessionAttempts.filter((a) => a.isCorrect).length;
        const accuracyPercentage = totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0;
        
        const totalTimeSeconds = sessionAttempts.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0);
        const averageSpeedSeconds = sessionAttempts.length > 0 ? Math.round(totalTimeSeconds / sessionAttempts.length) : 15;

        // Group strengths and weaknesses by topic
        const topicMap: Record<string, { total: number; correct: number }> = {};
        sessionAttempts.forEach((a) => {
          const topic = a.topicSlug || 'General Concepts';
          if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0 };
          topicMap[topic].total += 1;
          if (a.isCorrect) topicMap[topic].correct += 1;
        });

        const strengths: string[] = [];
        const weaknesses: string[] = [];

        Object.entries(topicMap).forEach(([topic, stats]) => {
          const acc = stats.correct / stats.total;
          const formattedTopic = topic.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          if (acc >= 0.7) {
            strengths.push(formattedTopic);
          } else {
            weaknesses.push(formattedTopic);
          }
        });

        if (strengths.length === 0 && correctCards > 0) {
          strengths.push('Active Recall & Key Terms');
        }
        if (weaknesses.length === 0 && correctCards < totalCards) {
          weaknesses.push('High-Speed Timed Execution');
        }

        // 250+ probability calculation
        // Accuracy weight (60%), Speed benchmark 40s (25%), Target score difficulty modifier (15%)
        const speedFactor = Math.max(0, Math.min(100, Math.round((1 - Math.max(0, averageSpeedSeconds - 10) / 40) * 100)));
        const targetDifficulty = Math.max(0.6, Math.min(1.0, 300 / Math.max(200, targetScore)));
        const calculatedScoreProbability = Math.round(
          Math.min(99, Math.max(15, (accuracyPercentage * 0.65 + speedFactor * 0.35) * targetDifficulty))
        );

        const summary: WorkoutSessionSummary = {
          subject: selectedSubject,
          totalCards,
          correctCards,
          accuracyPercentage,
          averageSpeedSeconds,
          totalTimeSeconds,
          attempts: sessionAttempts,
          strengths,
          weaknesses,
          calculatedScoreProbability,
        };

        get().incrementStreak();
        set({ lastSessionSummary: summary });
        return summary;
      },

      resetWorkout: () => {
        set({
          currentIndex: 0,
          sessionAttempts: [],
        });
      },
    }),
    {
      name: 'jamb-scholar-workout-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
