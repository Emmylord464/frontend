"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { del, get, set } from "idb-keyval";

const idbStorage = {
  getItem: async (name: string) => (await get<string>(name)) ?? null,
  setItem: async (name: string, value: string) => {
    await set(name, value);
  },
  removeItem: async (name: string) => {
    await del(name);
  },
};

export type Subject =
  | "USE_OF_ENGLISH"
  | "MATHEMATICS"
  | "PHYSICS"
  | "CHEMISTRY";

interface ExamState {
  activeSubject: Subject;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timeRemainingSeconds: number;
  isExamActive: boolean;
  setActiveSubject: (subject: Subject) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: string, answer: string) => void;
  removeAnswer: (questionId: string) => void;
  setTimeRemainingSeconds: (seconds: number) => void;
  startExam: () => void;
  pauseExam: () => void;
  resetExam: () => void;
}

const initialExamState = {
  activeSubject: "USE_OF_ENGLISH" as Subject,
  currentQuestionIndex: 0,
  answers: {},
  timeRemainingSeconds: 0,
  isExamActive: false,
};

export const useExamStore = create<ExamState>()(
  persist(
    (setState) => ({
      ...initialExamState,
      setActiveSubject: (activeSubject) => setState({ activeSubject }),
      setCurrentQuestionIndex: (currentQuestionIndex) =>
        setState({ currentQuestionIndex }),
      setAnswer: (questionId, answer) =>
        setState((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),
      removeAnswer: (questionId) =>
        setState((state) => {
          const answers = { ...state.answers };
          delete answers[questionId];
          return { answers };
        }),
      setTimeRemainingSeconds: (timeRemainingSeconds) =>
        setState({ timeRemainingSeconds }),
      startExam: () => setState({ isExamActive: true }),
      pauseExam: () => setState({ isExamActive: false }),
      resetExam: () => setState(initialExamState),
    }),
    {
      name: "jamb-ai-exam-state",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        activeSubject: state.activeSubject,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        timeRemainingSeconds: state.timeRemainingSeconds,
        isExamActive: state.isExamActive,
      }),
    },
  ),
);