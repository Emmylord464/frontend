import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1.1,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // Viscous decelerating cubic bezier
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
