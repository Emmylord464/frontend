export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  targetCourse: string;
  targetScore: number;
  streakCount: number;
}

export interface DrillCard {
  id: string;
  subject: string;
  questionText: string;
  options: { key: string; text: string }[];
  correctOption: string;
  explanation: string;
  year?: string;
}

export interface AnalyticsSummary {
  subject: string;
  masteryScore: number;
  scoreProbability: number;
  strengths: string[];
  weaknesses: string[];
  totalAttempts: number;
  accuracyRate: number;
  averageSpeedSeconds: number;
  targetScore: number;
  streakCount: number;
}

