'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProbabilityGaugeProps {
  percentage: number;
  ratingTier: string;
  ratingColor?: string;
  size?: number;
  strokeWidth?: number;
}

export const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({
  percentage,
  ratingTier,
  ratingColor = '#10b981',
  size = 180,
  strokeWidth = 14,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[#e5e5e3] dark:text-[#282b2e]"
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ratingColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-editorial text-4xl font-bold tracking-tight text-[#1a1c1c] dark:text-white"
          >
            {percentage}%
          </motion.span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#747878] dark:text-[#9ca3af] font-ui">
            250+ Chance
          </span>
        </div>
      </div>

      {/* Tier Badge */}
      <div
        className="mt-3 px-3 py-1 rounded-full text-xs font-semibold tracking-wide font-ui"
        style={{
          backgroundColor: `${ratingColor}15`,
          color: ratingColor,
        }}
      >
        {ratingTier}
      </div>
    </div>
  );
};
