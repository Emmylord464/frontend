import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Layers, BarChart2, FileCheck, Building2 } from 'lucide-react';
import { Screen } from '../../types';
import { playTapSound } from '../../utils/audio';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

interface NavItem {
  id: Screen;
  label: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'drill', label: 'Drill', icon: Layers },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'admissions', label: 'Unis & Portals', icon: Building2 },
  { id: 'mock', label: 'CBT Mock', icon: FileCheck },
  { id: 'analytics', label: 'Progress', icon: BarChart2 },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onNavigate,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/60 dark:border-stone-800/60 bg-white/90 dark:bg-[#141517]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-1 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                playTapSound();
                onNavigate(item.id);
              }}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-colors duration-200 cursor-pointer ${
                isActive
                  ? 'text-stone-900 dark:text-stone-100'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {/* Active animated sliding background pill & top dot */}
              {isActive && (
                <>
                  <motion.div
                    layoutId="activeBottomNavPill"
                    className="absolute inset-x-1 inset-y-0.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/60 -z-10 ring-1 ring-inset ring-black/5 dark:ring-white/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                  <motion.span
                    layoutId="activeBottomNavDot"
                    className="absolute -top-1.5 h-1 w-1 rounded-full bg-stone-900 dark:bg-stone-100"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                </>
              )}
              <div
                className={`relative flex h-6 w-6 items-center justify-center rounded-lg transition-transform duration-200 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              >
                <Icon
                  className="h-4.5 w-4.5"
                  strokeWidth={1.5}
                />
              </div>
              <span
                className={`text-[9px] sm:text-[10px] tracking-tight uppercase transition-colors font-ui mt-0.5 truncate max-w-[70px] ${
                  isActive
                    ? 'font-semibold text-stone-900 dark:text-stone-100'
                    : 'font-normal text-stone-500 dark:text-stone-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
