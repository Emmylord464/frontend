'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface Props {
  value: number;
  className?: string;
}

export function AnimatedScore({ value, className = '' }: Props) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString());

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1], // expo-out
    });
    return controls.stop;
  }, [count, value]);

  return <motion.span className={className}>{rounded}</motion.span>;
}

