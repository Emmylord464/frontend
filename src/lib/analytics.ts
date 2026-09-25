export interface ProbabilityResult {
  probabilityPercentage: number;
  ratingTier: 'Elite Ready' | 'High Chance' | 'Competitive' | 'Needs Reinforcement';
  ratingColor: string;
  summaryMessage: string;
  estimatedJambScore: number;
  accuracyRate: number;
  averageSpeedSeconds: number;
  strengths: string[];
  weaknesses: string[];
}

export function calculateScoreProbability(params: {
  accuracyPercentage: number;
  averageSpeedSeconds: number;
  targetScore: number;
  strengths?: string[];
  weaknesses?: string[];
}): ProbabilityResult {
  const { accuracyPercentage, averageSpeedSeconds, targetScore, strengths = [], weaknesses = [] } = params;

  // 1. Accuracy Score (0 - 100)
  const accScore = Math.max(0, Math.min(100, accuracyPercentage));

  // 2. Speed Factor vs 40-second CBT Benchmark
  // 40s is standard per-question budget in 120-minute / 180-question exam (40 seconds per card)
  // Ideal speed: 10-25 seconds per card. Over 45 seconds gets penalized.
  let speedScore = 100;
  if (averageSpeedSeconds > 40) {
    speedScore = Math.max(20, 100 - (averageSpeedSeconds - 40) * 3);
  } else if (averageSpeedSeconds > 25) {
    speedScore = 100 - (averageSpeedSeconds - 25) * 1.5;
  }

  // 3. Target Score modifier (higher target requires higher precision)
  const targetBaseline = Math.max(200, Math.min(400, targetScore || 250));
  const targetFactor = 250 / targetBaseline;

  // 4. Weighted Composite Probability (65% accuracy, 35% speed efficiency)
  const rawProb = (accScore * 0.7 + speedScore * 0.3) * targetFactor;
  const probabilityPercentage = Math.round(Math.max(12, Math.min(98, rawProb)));

  // 5. Estimated Equivalent JAMB UTME Score (Scaled from 100 to 400)
  const estimatedJambScore = Math.round(Math.max(140, Math.min(385, (probabilityPercentage / 100) * 400)));

  // 6. Rating Tier
  let ratingTier: ProbabilityResult['ratingTier'] = 'Competitive';
  let ratingColor = '#f59e0b';
  let summaryMessage = 'Solid baseline. Targeted drills in weak areas will push you over 280+.';

  if (probabilityPercentage >= 80) {
    ratingTier = 'Elite Ready';
    ratingColor = '#10b981';
    summaryMessage = 'Outstanding performance! You are on track for merit admission in top faculties.';
  } else if (probabilityPercentage >= 65) {
    ratingTier = 'High Chance';
    ratingColor = '#06b6d4';
    summaryMessage = 'High probability of clearing 250+ threshold. Focus on speed drills.';
  } else if (probabilityPercentage >= 45) {
    ratingTier = 'Competitive';
    ratingColor = '#f59e0b';
    summaryMessage = 'Competitive foundation. Reinforce active recall on missed topics.';
  } else {
    ratingTier = 'Needs Reinforcement';
    ratingColor = '#f43f5e';
    summaryMessage = 'Requires additional high-yield practice to guarantee the 250+ safety mark.';
  }

  return {
    probabilityPercentage,
    ratingTier,
    ratingColor,
    summaryMessage,
    estimatedJambScore,
    accuracyRate: accScore,
    averageSpeedSeconds,
    strengths: strengths.length > 0 ? strengths : ['Active Recall Recognition', 'Core Concepts'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Rapid Socratic Elimination'],
  };
}
