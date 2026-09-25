export type Screen =
  | 'subjects'
  | 'drill'
  | 'recovery'
  | 'mock'
  | 'analytics'
  | 'planner'
  | 'profile'
  | 'settings'
  | 'admissions'
  | 'syndicate';

export type UserTier = 'free' | 'pro';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  jambRegNumber?: string;
  avatar?: string;
}

export type SubjectCategory = 'All' | 'Sciences' | 'Commercial' | 'Arts' | 'Languages';

export interface Subject {
  id: string;
  name: string;
  category: 'Sciences' | 'Commercial' | 'Arts' | 'Languages';
  readiness: number; // percentage (e.g. 86)
  topics: string;
  questionsCount: number;
  iconName: string;
  dominantColor?: string;
  isProOnly?: boolean;
}

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  subjectId: string;
  subjectName: string;
  year?: string;
  text: string;
  passage?: string;
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  syllabusTopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface CourseTrack {
  id: string;
  name: string;
  faculty: string;
  targetCutoff: number; // e.g. 315
  competitiveness: 'Very High' | 'High' | 'Moderate';
  requiredSubjects: string[];
}

export type Department = 'Sciences' | 'Commercial' | 'Arts';
export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  name: string;
  email: string;
  tier: UserTier;
  jambRegNumber: string;
  targetScore: number;
  currentEstimatedScore: number;
  courseTrack: CourseTrack;
  department?: Department;
  themeMode?: ThemeMode;
  englishUnlocked?: boolean;
  streakDays: number;
  freezeTokens: number;
  studiedToday: boolean;
  totalQuestionsAnswered: number;
  accuracyRate: number;
  dailyQuestionGoal?: number;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  reminderDays?: string[];
}

export interface WeaknessArea {
  id: string;
  subject: string;
  topic: string;
  mastery: number;
  questionsMissed: number;
  recommendedDrills: number;
}

export interface StrengthArea {
  id: string;
  subject: string;
  topic: string;
  mastery: number;
  streak: number;
}
