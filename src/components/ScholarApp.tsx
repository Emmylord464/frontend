'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Screen, UserProfile, Subject, AuthUser, Question, Department, ThemeMode } from '@/types';
import {
  INITIAL_COURSE_TRACKS,
  INITIAL_SUBJECTS,
  INITIAL_QUESTIONS,
  INITIAL_WEAKNESSES,
  INITIAL_STRENGTHS,
} from '@/data/jambData';
import { authService } from '@/services/authService';
import { fetchSubjectQuestionsAction } from '@/actions/aloc-questions';
import { TopBar } from '@/components/Navigation/TopBar';
import { BottomNav } from '@/components/Navigation/BottomNav';
import { ProfileView } from '@/components/Profile/ProfileView';
import { SubjectsView } from '@/components/Subjects/SubjectsView';
import { DrillView } from '@/components/Drill/DrillView';
import { AnalyticsView } from '@/components/Analytics/AnalyticsView';
import { PlannerView } from '@/components/Planner/PlannerView';
import { StreakModal } from '@/components/Modals/StreakModal';
import { ScholarIntroScreen } from '@/components/Intro/ScholarIntroScreen';
import { AuthModal } from '@/components/Auth/AuthModal';
import { playTapSound } from '@/utils/audio';
import { getInitialTheme, applyTheme } from '@/utils/theme';
import { Timer, ArrowRight } from 'lucide-react';

export default function ScholarApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('subjects');
  const [activeDrillSubjectId, setActiveDrillSubjectId] = useState<string>('english');
  const [drillQuestions, setDrillQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(145); // started session 2m 25s ago
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  // Load questions dynamically for active drill subject
  useEffect(() => {
    let cancelled = false;
    fetchSubjectQuestionsAction(activeDrillSubjectId, 30)
      .then(({ questions: qs }) => {
        if (cancelled) return;
        if (qs && qs.length > 0) {
          setDrillQuestions(qs);
        } else {
          const fallback = INITIAL_QUESTIONS.filter((q) => q.subjectId === activeDrillSubjectId);
          setDrillQuestions(fallback.length > 0 ? fallback : INITIAL_QUESTIONS);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = INITIAL_QUESTIONS.filter((q) => q.subjectId === activeDrillSubjectId);
          setDrillQuestions(fallback.length > 0 ? fallback : INITIAL_QUESTIONS);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeDrillSubjectId]);

  const handleToggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  // Netflix-style Scholar Cinematic Intro State
  const [showIntro, setShowIntro] = useState(true);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);

  // User Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const existing = authService.getCurrentUser();
    return {
      name: existing?.name || 'Amina Adebayo',
      email: existing?.email || 'candidate@scholar.edu',
      tier: 'free',
      jambRegNumber: existing?.jambRegNumber || '2025/JAMB/78912',
      targetScore: 320,
      currentEstimatedScore: 294,
      courseTrack: INITIAL_COURSE_TRACKS[0], // Medicine & Surgery (320 target)
      department: 'Sciences',
      themeMode: getInitialTheme(),
      streakDays: 14,
      freezeTokens: 2,
      studiedToday: false,
      totalQuestionsAnswered: 1428,
      accuracyRate: 79,
      dailyReminderEnabled: true,
      dailyReminderTime: '19:30',
      reminderDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      dailyQuestionGoal: 50,
    };
  });

  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [weaknesses] = useState(INITIAL_WEAKNESSES);
  const [strengths] = useState(INITIAL_STRENGTHS);

  const handleUpdateProfile = useCallback((updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleNavigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectSubject = useCallback((subjectId: string) => {
    setActiveDrillSubjectId(subjectId);
    setCurrentScreen('drill');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSessionTick = useCallback((seconds: number) => {
    setSessionSeconds(seconds);
  }, []);

  const handleRecordDrillResult = useCallback((correct: boolean, subjectId: string) => {
    setProfile((prev) => {
      const newTotal = prev.totalQuestionsAnswered + 1;
      const prevCorrect = Math.round((prev.accuracyRate / 100) * prev.totalQuestionsAnswered);
      const newCorrect = prevCorrect + (correct ? 1 : 0);
      const newAccuracy = Math.round((newCorrect / newTotal) * 100);
      const newEst = Math.min(400, prev.currentEstimatedScore + (correct && Math.random() > 0.6 ? 1 : 0));

      return {
        ...prev,
        totalQuestionsAnswered: newTotal,
        accuracyRate: newAccuracy,
        currentEstimatedScore: newEst,
      };
    });

    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === subjectId) {
          const delta = correct ? 1 : -0.5;
          const newReadiness = Math.min(99, Math.max(30, Math.round(sub.readiness + delta)));
          return { ...sub, readiness: newReadiness };
        }
        return sub;
      })
    );
  }, []);

  const handleLaunchTargetedDrill = (subjectId: string) => {
    setActiveDrillSubjectId(subjectId);
    setCurrentScreen('drill');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogTodayPractice = () => {
    if (!profile.studiedToday) {
      setProfile((prev) => ({
        ...prev,
        streakDays: prev.streakDays + 1,
        studiedToday: true,
      }));
      playTapSound();
    }
  };

  // Auth Handlers
  const handleAuthSuccess = (user: AuthUser) => {
    setProfile((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
      jambRegNumber: user.jambRegNumber || prev.jambRegNumber,
    }));
    setAuthModalMode(null);
    setCurrentScreen('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    authService.logout();
    setAuthModalMode('login');
  };

  const handleIngestQuestions = useCallback((newQuestions: Question[]) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        const addedForSub = newQuestions.filter((q) => q.subjectId === sub.id).length;
        return {
          ...sub,
          questionsCount: sub.questionsCount + (addedForSub > 0 ? addedForSub : 50),
        };
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] text-[#1a1c1c] dark:text-[#f3f4f6] antialiased flex flex-col items-center justify-start transition-colors duration-200 selection:bg-[#e2e2e2] dark:selection:bg-[#333]">
      {/* Netflix-style Scholar Cinematic Intro Overlay */}
      {showIntro && (
        <ScholarIntroScreen onFinish={() => setShowIntro(false)} />
      )}

      {/* Outer Shell container */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md min-h-screen sm:min-h-[850px] sm:my-4 sm:rounded-3xl sm:border sm:border-[#e5e5e3] dark:sm:border-[#282b2e] sm:shadow-2xl bg-[#f9f9f8] dark:bg-[#121314] relative overflow-hidden flex flex-col'
            : 'w-full max-w-2xl min-h-screen flex flex-col'
        }`}
      >
        {/* Top App Bar */}
        <TopBar
          streakDays={profile.streakDays}
          activeScreen={currentScreen}
          isMobileFrame={isMobileFrame}
          isDarkMode={themeMode === 'dark'}
          sessionSeconds={sessionSeconds}
          onSessionTick={handleSessionTick}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
          onToggleTheme={handleToggleTheme}
          onOpenStreakModal={() => setIsStreakModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col">
          {currentScreen === 'profile' && (
            <ProfileView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onStartDrillForSubject={handleSelectSubject}
              onSignOut={handleSignOut}
              onReplayIntro={() => setShowIntro(true)}
            />
          )}

          {currentScreen === 'subjects' && (
            <div className="flex flex-col flex-1">
              {/* Minimalist JAMB Mock Exam Card */}
              <div className="px-4 pt-4 pb-1">
                <Link
                  href="/mock"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1a1c1e] border border-[#e5e5e3] dark:border-[#282b2e] shadow-xs hover:border-[#1a1c1c] dark:hover:border-white transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] shrink-0">
                      <Timer className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-base font-semibold text-[#1a1c1c] dark:text-white leading-tight">
                        JAMB Mock Exam
                      </h3>
                      <p className="text-xs text-[#747878] dark:text-[#9ca3af] mt-0.5">
                        120 Questions · 120 Minutes · Timed Exam
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#747878] dark:text-[#9ca3af] group-hover:text-[#1a1c1c] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>

              <SubjectsView
                subjects={subjects}
                userDepartment={profile.department || 'Sciences'}
                onSelectSubject={handleSelectSubject}
                onUpdateDepartment={(dept) => handleUpdateProfile({ department: dept })}
              />
            </div>
          )}

          {currentScreen === 'drill' && (
            <DrillView
              questions={drillQuestions}
              subjects={subjects}
              activeSubjectId={activeDrillSubjectId}
              onSubjectChange={setActiveDrillSubjectId}
              onRecordResult={handleRecordDrillResult}
              onNavigateToAnalytics={() => handleNavigate('analytics')}
              onIngestQuestions={handleIngestQuestions}
              dailyGoal={profile.dailyQuestionGoal || 50}
              userDepartment={profile.department || 'Sciences'}
            />
          )}

          {currentScreen === 'planner' && (
            <PlannerView
              profile={profile}
              subjects={subjects}
              onUpdateProfile={handleUpdateProfile}
              onLaunchDrill={(subjectId) => {
                if (subjectId) setActiveDrillSubjectId(subjectId);
                handleNavigate('drill');
              }}
            />
          )}

          {currentScreen === 'analytics' && (
            <AnalyticsView
              profile={profile}
              subjects={subjects}
              weaknesses={weaknesses}
              strengths={strengths}
              onLaunchTargetedDrill={handleLaunchTargetedDrill}
              onUpdateProfile={handleUpdateProfile}
              onNavigateToPlanner={() => handleNavigate('planner')}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeScreen={currentScreen}
          onNavigate={handleNavigate}
        />

        {/* Streak Details Modal */}
        <StreakModal
          isOpen={isStreakModalOpen}
          onClose={() => setIsStreakModalOpen(false)}
          streakDays={profile.streakDays}
          freezeTokens={profile.freezeTokens}
          studiedToday={profile.studiedToday}
          onLogToday={handleLogTodayPractice}
        />

        {/* Authentication Modal (Candidate Profile Access) */}
        <AuthModal
          isOpen={authModalMode !== null}
          initialMode={authModalMode || 'login'}
          onClose={() => setAuthModalMode(null)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
}
