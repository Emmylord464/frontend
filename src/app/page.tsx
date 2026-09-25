'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#f9f9f8] dark:bg-[#121314] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1c1c] dark:bg-white text-white dark:text-[#121314] shadow-md animate-pulse">
          <span className="font-serif text-lg font-bold italic">S</span>
        </div>
        <p className="text-xs font-sans text-stone-500 tracking-wider uppercase">Loading JAMB Scholar…</p>
      </div>
    </div>
  ),
});

export default function Page() {
  return <App />;
}
