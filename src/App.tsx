'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Screen, UserProfile, Subject, AuthUser, Question, Department, ThemeMode } from './types';
import {
  INITIAL_COURSE_TRACKS,
  INITIAL_SUBJECTS,
  INITIAL_QUESTIONS,
  INITIAL_WEAKNESSES,
  INITIAL_STRENGTHS,
} from './data/jambData';
import { authService } from './services/authService';
import { TopBar } from './components/Navigation/TopBar';
import { BottomNav } from './components/Navigation/BottomNav';
import { ProfileView } from './components/Profile/ProfileView';
import { SubjectsView } from './components/Subjects/SubjectsView';
import { DrillView } from './components/Drill/DrillView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { PlannerView } from './components/Planner/PlannerView';
import { WeaknessLabView } from './components/Recovery/WeaknessLabView';
import { MockExamView } from './components/Mock/MockExamView';
import { SettingsView } from './components/Settings/SettingsView';
import { AdmissionsOracleView } from './components/Admissions/AdmissionsOracleView';
import { SyndicateDeskView } from './components/Syndicate/SyndicateDeskView';
import { StreakModal } from './components/Modals/StreakModal';
import { ScholarIntroScreen } from './components/Intro/ScholarIntroScreen';
import { AuthModal } from './components/Auth/AuthModal';
import { playTapSound } from './utils/audio';
import { getInitialTheme, applyTheme } from './utils/theme';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('subjects');
  const [activeDrillSubjectId, setActiveDrillSubjectId] = useState<string>('maths');
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(145); // started session 2m 25s ago
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

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
      englishUnlocked: false,
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

  const [todayDrillsBySubject, setTodayDrillsBySubject] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('scholar_today_subject_drills');
      return saved ? JSON.parse(saved) : {
        maths: 11,
        physics: 8,
        chemistry: 6,
        biology: 14,
        english: 0,
        economics: 5,
        government: 9,
        literature: 4,
        geography: 2,
        agric: 6,
        commerce: 4,
        crs: 10,
      };
    } catch {
      return {
        maths: 11,
        physics: 8,
        chemistry: 6,
        biology: 14,
        english: 0,
        economics: 5,
        government: 9,
        literature: 4,
        geography: 2,
        agric: 6,
        commerce: 4,
        crs: 10,
      };
    }
  });

  const handleUpdateProfile = useCallback((updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleUnlockEnglish = useCallback(() => {
    setProfile((prev) => ({ ...prev, englishUnlocked: true }));
  }, []);

  const handleNavigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
    // Scroll to top on navigation
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

    // Update today's drill count for this subject
    setTodayDrillsBySubject((prev) => {
      const current = prev[subjectId] || 0;
      const updated = { ...prev, [subjectId]: current + 1 };
      try {
        localStorage.setItem('scholar_today_subject_drills', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update subject readiness slightly
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
        <main className="flex-1 w-full flex flex-col overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full flex flex-col"
            >
              {currentScreen === 'profile' && (
                <ProfileView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onStartDrillForSubject={handleSelectSubject}
                  onSignOut={handleSignOut}
                  onReplayIntro={() => setShowIntro(true)}
                  onNavigateToSettings={() => handleNavigate('settings')}
                  onNavigateToAdmissions={() => handleNavigate('admissions')}
                  onNavigateToSyndicate={() => handleNavigate('syndicate')}
                />
              )}

              {currentScreen === 'subjects' && (
                <SubjectsView
                  subjects={subjects}
                  userDepartment={profile.department || 'Sciences'}
                  englishUnlocked={profile.englishUnlocked}
                  dailyGoal={profile.dailyQuestionGoal || 50}
                  dailyProgressBySubject={todayDrillsBySubject}
                  onSelectSubject={handleSelectSubject}
                  onUpdateDepartment={(dept) => handleUpdateProfile({ department: dept })}
                  onUnlockEnglish={handleUnlockEnglish}
                  onUpdateDailyGoal={(goal) => handleUpdateProfile({ dailyQuestionGoal: goal })}
                />
              )}

              {currentScreen === 'drill' && (
                <DrillView
                  questions={INITIAL_QUESTIONS}
                  subjects={subjects}
                  activeSubjectId={activeDrillSubjectId}
                  onSubjectChange={setActiveDrillSubjectId}
                  onRecordResult={handleRecordDrillResult}
                  onNavigateToAnalytics={() => handleNavigate('analytics')}
                  onIngestQuestions={handleIngestQuestions}
                  dailyGoal={profile.dailyQuestionGoal || 50}
                  userDepartment={profile.department || 'Sciences'}
                  englishUnlocked={profile.englishUnlocked}
                  onUnlockEnglish={handleUnlockEnglish}
                />
              )}

              {currentScreen === 'mock' && (
                <MockExamView
                  profile={profile}
                  subjects={subjects}
                  onNavigateToSyllabus={() => handleNavigate('subjects')}
                  onLaunchTargetedDrill={handleLaunchTargetedDrill}
                  onNavigateToRecovery={() => handleNavigate('recovery')}
                  onFinishMock={(score) => {
                    setProfile((prev) => ({
                      ...prev,
                      currentEstimatedScore: Math.min(400, Math.max(prev.currentEstimatedScore, Math.round((prev.currentEstimatedScore + score) / 2))),
                    }));
                  }}
                />
              )}

              {currentScreen === 'recovery' && (
                <WeaknessLabView
                  profile={profile}
                  subjects={subjects}
                  weaknesses={weaknesses}
                  strengths={strengths}
                  onLaunchTargetedDrill={(subId) => {
                    handleLaunchTargetedDrill(subId);
                  }}
                  onNavigateToDrill={() => handleNavigate('drill')}
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
                  onNavigateToRecovery={() => handleNavigate('recovery')}
                />
              )}

              {currentScreen === 'settings' && (
                <SettingsView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onSignOut={handleSignOut}
                  onReplayIntro={() => setShowIntro(true)}
                />
              )}

              {currentScreen === 'admissions' && (
                <AdmissionsOracleView
                  profile={profile}
                  onNavigateToDrill={handleLaunchTargetedDrill}
                />
              )}

              {currentScreen === 'syndicate' && (
                <SyndicateDeskView
                  profile={profile}
                  onNavigateToDrill={handleLaunchTargetedDrill}
                />
              )}
            </motion.div>
          </AnimatePresence>
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
