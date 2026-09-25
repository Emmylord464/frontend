import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JAMB Scholar — Minimalist UTME Flashcards & Diagnostics',
  description: 'A touch-first, mobile-first JAMB UTME active-recall flashcard and diagnostic score predictor MVP.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'JAMB Scholar',
  },
};

export const viewport: Viewport = {
  themeColor: '#121314',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f9f9f8] dark:bg-[#121314] text-[#1a1c1c] dark:text-[#f3f4f6]">
        {children}
      </body>
    </html>
  );
}
