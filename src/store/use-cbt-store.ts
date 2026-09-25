import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { del, get, set } from 'idb-keyval';

export interface CBTQuestion {
  id: string;
  subject: string;
  questionIndex: number;
  questionText: string;
  options: Record<string, string>;
  correctOption?: string;
  explanation?: string;
}

export type CBTExamStatus = 'idle' | 'running' | 'paused' | 'submitted';

interface CBTState {
  examStatus: CBTExamStatus;
  timeRemainingSeconds: number;
  activeSubject: string;
  activeQuestionIndex: number;
  questions: CBTQuestion[];
  userAnswers: Record<string, string>;
  flaggedQuestionIndexes: number[];
  setQuestions: (questions: CBTQuestion[]) => void;
  setActiveSubject: (subject: string) => void;
  setActiveQuestionIndex: (index: number) => void;
  setAnswer: (questionId: string, option: string) => void;
  removeAnswer: (questionId: string) => void;
  toggleFlag: (questionIndex: number) => void;
  setTimeRemainingSeconds: (seconds: number) => void;
  tick: () => void;
  startExam: () => void;
  pauseExam: () => void;
  submitExam: () => void;
  resetExam: () => void;
}

export const CBT_DURATION_SECONDS = 120 * 60;

const initialCBTState = {
  examStatus: 'idle' as CBTExamStatus,
  timeRemainingSeconds: CBT_DURATION_SECONDS,
  activeSubject: 'USE_OF_ENGLISH',
  activeQuestionIndex: 0,
  questions: [] as CBTQuestion[],
  userAnswers: {} as Record<string, string>,
  flaggedQuestionIndexes: [] as number[],
};

const idbStorage = {
  getItem: async (name: string) => (await get<string>(name)) ?? null,
  setItem: async (name: string, value: string) => {
    await set(name, value);
  },
  removeItem: async (name: string) => {
    await del(name);
  },
};

function clampQuestionIndex(index: number, questionCount: number) {
  if (questionCount === 0) return 0;
  return Math.min(Math.max(index, 0), questionCount - 1);
}

export const useCBTStore = create<CBTState>()(
  persist(
    (setState) => ({
      ...initialCBTState,
      setQuestions: (questions) =>
        setState((state) => ({
          questions,
          activeQuestionIndex: clampQuestionIndex(state.activeQuestionIndex, questions.length),
        })),
      setActiveSubject: (activeSubject) => setState({ activeSubject }),
      setActiveQuestionIndex: (activeQuestionIndex) =>
        setState((state) => ({
          activeQuestionIndex: clampQuestionIndex(activeQuestionIndex, state.questions.length),
        })),
      setAnswer: (questionId, option) =>
        setState((state) => ({
          userAnswers: { ...state.userAnswers, [questionId]: option },
        })),
      removeAnswer: (questionId) =>
        setState((state) => {
          const userAnswers = { ...state.userAnswers };
          delete userAnswers[questionId];
          return { userAnswers };
        }),
      toggleFlag: (questionIndex) =>
        setState((state) => ({
          flaggedQuestionIndexes: state.flaggedQuestionIndexes.includes(questionIndex)
            ? state.flaggedQuestionIndexes.filter((index) => index !== questionIndex)
            : [...state.flaggedQuestionIndexes, questionIndex].sort((first, second) => first - second),
        })),
      setTimeRemainingSeconds: (timeRemainingSeconds) =>
        setState({ timeRemainingSeconds: Math.max(0, timeRemainingSeconds) }),
      tick: () =>
        setState((state) => {
          if (state.examStatus !== 'running') return state;
          const timeRemainingSeconds = Math.max(0, state.timeRemainingSeconds - 1);
          return {
            timeRemainingSeconds,
            examStatus: timeRemainingSeconds === 0 ? 'paused' : state.examStatus,
          };
        }),
      startExam: () => setState({ examStatus: 'running' }),
      pauseExam: () => setState({ examStatus: 'paused' }),
      submitExam: () => setState({ examStatus: 'submitted' }),
      resetExam: () => setState(initialCBTState),
    }),
    {
      name: 'jamb-ai-cbt-state',
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);
