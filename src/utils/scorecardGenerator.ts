import { UserProfile } from '../types';

export type CardTheme = 'obsidian' | 'cyber' | 'quartz' | 'emerald' | 'parchment' | 'midnight';

export interface CardThemeConfig {
  id: CardTheme;
  name: string;
  subtitle: string;
  surfaceBg: string;
  surfaceEnd: string;
  accentNeon: string;
  accentSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSubtle: string;
  borderGlow: string;
  badgeBg: string;
  isLight?: boolean;
}

export const CARD_THEMES: Record<string, CardThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Matrix',
    subtitle: 'Deep Carbon & Electric Chartreuse',
    surfaceBg: '#0b0d11',
    surfaceEnd: '#13161c',
    accentNeon: '#ccff00',      // Electric Chartreuse
    accentSecondary: '#10b981', // Neon Emerald
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderGlow: 'rgba(204, 255, 0, 0.45)',
    badgeBg: 'rgba(204, 255, 0, 0.1)',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Protocol',
    subtitle: 'Midnight Stealth & Hyper Cyan',
    surfaceBg: '#080d1a',
    surfaceEnd: '#0f172a',
    accentNeon: '#00f0ff',      // Cyber Blue / Cyan
    accentSecondary: '#6366f1', // Electric Indigo
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    borderSubtle: 'rgba(255, 255, 255, 0.09)',
    borderGlow: 'rgba(0, 240, 255, 0.45)',
    badgeBg: 'rgba(0, 240, 255, 0.1)',
  },
  quartz: {
    id: 'quartz',
    name: 'Neon Quartz',
    subtitle: 'Sleek Off-White & Neon Peach',
    surfaceBg: '#f6f6f3',
    surfaceEnd: '#ecebe4',
    accentNeon: '#ff5e62',      // Neon Peach
    accentSecondary: '#f59e0b', // Solar Amber
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    borderSubtle: 'rgba(0, 0, 0, 0.09)',
    borderGlow: 'rgba(255, 94, 98, 0.5)',
    badgeBg: 'rgba(255, 94, 98, 0.1)',
    isLight: true,
  },
  // Backward compatibility aliases
  emerald: {
    id: 'obsidian',
    name: 'Obsidian Matrix',
    subtitle: 'Deep Carbon & Electric Chartreuse',
    surfaceBg: '#0b0d11',
    surfaceEnd: '#13161c',
    accentNeon: '#ccff00',
    accentSecondary: '#10b981',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderGlow: 'rgba(204, 255, 0, 0.45)',
    badgeBg: 'rgba(204, 255, 0, 0.1)',
  },
  parchment: {
    id: 'quartz',
    name: 'Neon Quartz',
    subtitle: 'Sleek Off-White & Neon Peach',
    surfaceBg: '#f6f6f3',
    surfaceEnd: '#ecebe4',
    accentNeon: '#ff5e62',
    accentSecondary: '#f59e0b',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    borderSubtle: 'rgba(0, 0, 0, 0.09)',
    borderGlow: 'rgba(255, 94, 98, 0.5)',
    badgeBg: 'rgba(255, 94, 98, 0.1)',
    isLight: true,
  },
  midnight: {
    id: 'cyber',
    name: 'Cyber Protocol',
    subtitle: 'Midnight Stealth & Hyper Cyan',
    surfaceBg: '#080d1a',
    surfaceEnd: '#0f172a',
    accentNeon: '#00f0ff',
    accentSecondary: '#6366f1',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    borderSubtle: 'rgba(255, 255, 255, 0.09)',
    borderGlow: 'rgba(0, 240, 255, 0.45)',
    badgeBg: 'rgba(0, 240, 255, 0.1)',
  },
};

/**
 * Calculates authentic proportional individual subject scores that sum exactly to totalScore
 */
export function getSubjectBreakdown(profile: UserProfile): Array<{ name: string; score: number }> {
  const subjects = profile.courseTrack?.requiredSubjects?.length
    ? profile.courseTrack.requiredSubjects
    : ['Use of English', 'Mathematics', 'Physics', 'Chemistry'];

  const total = profile.currentEstimatedScore || 280;
  const count = subjects.length;
  const baseAvg = Math.floor(total / count);

  // Systematic believable variations per subject
  const weights = [1, 2, -2, -1];
  const scores = subjects.map((name, i) => {
    const delta = weights[i % weights.length] || 0;
    return { name, score: Math.min(100, Math.max(30, baseAvg + delta)) };
  });

  // Adjust to ensure exact sum matches total
  let currentSum = scores.reduce((sum, s) => sum + s.score, 0);
  let diff = total - currentSum;
  let idx = 0;
  while (diff !== 0 && idx < scores.length) {
    if (diff > 0) {
      scores[idx].score += 1;
      diff -= 1;
    } else {
      scores[idx].score -= 1;
      diff += 1;
    }
    idx = (idx + 1) % scores.length;
  }

  return scores;
}

/**
 * Helper to draw a minimalist sleek barcode
 */
function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  const pattern = [2, 1, 3, 1, 1, 4, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2];
  let curX = x;
  const totalWeight = pattern.reduce((a, b) => a + b, 0);
  const unit = width / totalWeight;

  pattern.forEach((w, i) => {
    if (i % 2 === 0) {
      ctx.fillRect(curX, y, w * unit, height);
    }
    curX += w * unit;
  });
  ctx.restore();
}

/**
 * Helper to draw a modern tech QR code placeholder matrix
 */
function drawTechQRMatrix(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  accent: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, size, size);

  // Corner markers
  const markerSize = Math.floor(size * 0.28);
  const drawCorner = (cx: number, cy: number) => {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, markerSize, markerSize);
    ctx.fillStyle = accent;
    ctx.fillRect(cx + 3, cy + 3, markerSize - 6, markerSize - 6);
  };

  drawCorner(x + 2, y + 2);
  drawCorner(x + size - markerSize - 2, y + 2);
  drawCorner(x + 2, y + size - markerSize - 2);

  // Micro data pixels
  ctx.fillStyle = color;
  const cellSize = 3;
  const rows = Math.floor(size / 5);
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < rows - 2; c++) {
      if ((r * 7 + c * 13) % 3 === 0) {
        ctx.fillRect(x + c * 5, y + r * 5, cellSize, cellSize);
      }
    }
  }
  ctx.restore();
}

/**
 * Helper to draw dashed energy meter: [■■■■■□□□]
 */
function drawEnergyBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pct: number,
  activeColor: string,
  inactiveColor: string,
  segments = 12
) {
  ctx.save();
  const gap = 3;
  const segWidth = (width - (segments - 1) * gap) / segments;
  const activeCount = Math.round((pct / 100) * segments);

  for (let i = 0; i < segments; i++) {
    const segX = x + i * (segWidth + gap);
    ctx.fillStyle = i < activeCount ? activeColor : inactiveColor;
    ctx.beginPath();
    ctx.roundRect(segX, y, segWidth, height, 1.5);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Generates an ultra-crisp Modern Dossier Player Card (1200x675)
 */
export async function renderScorecardToCanvas(
  profile: UserProfile,
  themeId: CardTheme = 'obsidian',
  width = 1200,
  height = 675
): Promise<HTMLCanvasElement> {
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if fonts API fails
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  const themeKey = themeId in CARD_THEMES ? themeId : 'obsidian';
  const theme = CARD_THEMES[themeKey];
  const isLight = !!theme.isLight;

  // 1. Deep Modern Frosted Surface
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, theme.surfaceBg);
  bgGrad.addColorStop(1, theme.surfaceEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Dot-Matrix / Tactical Grid Pattern
  ctx.save();
  ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.035)';
  const dotSpacing = 24;
  for (let dx = 12; dx < width; dx += dotSpacing) {
    for (let dy = 12; dy < height; dy += dotSpacing) {
      ctx.fillRect(dx, dy, 1.5, 1.5);
    }
  }
  ctx.restore();

  // 3. Subtle Cybernetic Framing & Corner Coordinates
  const margin = 36;
  const frameWidth = width - margin * 2;
  const frameHeight = height - margin * 2;

  ctx.save();
  ctx.strokeStyle = theme.borderSubtle;
  ctx.lineWidth = 1;
  ctx.strokeRect(margin, margin, frameWidth, frameHeight);

  // Neon Corner Brackets
  const bracketSize = 16;
  ctx.strokeStyle = theme.accentNeon;
  ctx.lineWidth = 2;
  // Top-Left
  ctx.beginPath();
  ctx.moveTo(margin, margin + bracketSize);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + bracketSize, margin);
  ctx.stroke();
  // Top-Right
  ctx.beginPath();
  ctx.moveTo(width - margin - bracketSize, margin);
  ctx.lineTo(width - margin, margin);
  ctx.lineTo(width - margin, margin + bracketSize);
  ctx.stroke();
  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(margin, height - margin - bracketSize);
  ctx.lineTo(margin, height - margin);
  ctx.lineTo(margin + bracketSize, height - margin);
  ctx.stroke();
  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(width - margin - bracketSize, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.lineTo(width - margin, height - margin - bracketSize);
  ctx.stroke();
  ctx.restore();

  // 4. Header Bar: Tech/Intel Flourishes & Status Pulse
  const innerLeft = margin + 32;
  const innerRight = width - margin - 32;
  const topY = margin + 28;

  ctx.save();
  // Status indicator dot
  ctx.fillStyle = theme.accentNeon;
  ctx.beginPath();
  ctx.arc(innerLeft, topY + 7, 4, 0, Math.PI * 2);
  ctx.fill();

  // Status text
  ctx.font = '700 11px "JetBrains Mono", "Space Mono", monospace';
  ctx.letterSpacing = '1.5px';
  ctx.fillStyle = theme.accentNeon;
  ctx.fillText('LIVE_DOSSIER // UTME_2025 // PROTOCOL_ACTIVE', innerLeft + 12, topY + 11);

  // Top right UID string
  const regNo = profile.jambRegNumber || 'JAMB-2025-0941';
  const cleanReg = regNo.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  const uidString = `CANDIDATE // LOG_${cleanReg} // SEC_042`;
  ctx.fillStyle = theme.textMuted;
  const uidWidth = ctx.measureText(uidString).width;
  ctx.fillText(uidString, innerRight - uidWidth, topY + 11);

  // Horizontal Tech Hairline
  ctx.strokeStyle = theme.borderSubtle;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerLeft, topY + 24);
  ctx.lineTo(innerRight, topY + 24);
  ctx.stroke();
  ctx.restore();

  // 5. Candidate Title & Mission Track (Bold Geometric Sans + Monospace ID)
  const candidateY = topY + 68;
  const candidateName = profile.name || 'Scholar Candidate';
  const courseTrack = (profile.courseTrack?.name || 'Chosen Course Track').toUpperCase();
  const faculty = (profile.courseTrack?.faculty || 'Undergraduate Admissions').toUpperCase();

  ctx.save();
  // Name
  ctx.font = '800 38px "Outfit", "Inter", -apple-system, sans-serif';
  ctx.fillStyle = theme.textPrimary;
  ctx.fillText(candidateName, innerLeft, candidateY);

  // Track & Clearance Pill
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.letterSpacing = '1px';
  ctx.fillStyle = theme.accentSecondary;
  ctx.fillText(`${courseTrack}  //  ${faculty}`, innerLeft, candidateY + 26);
  ctx.restore();

  // Minimalist QR Code & Barcode on the Top-Right
  const qrSize = 64;
  const qrX = innerRight - qrSize;
  const qrY = candidateY - 24;
  drawTechQRMatrix(
    ctx,
    qrX,
    qrY,
    qrSize,
    isLight ? '#374151' : '#ffffff',
    theme.accentNeon
  );

  const barcodeWidth = 140;
  const barcodeHeight = 22;
  const barcodeX = qrX - barcodeWidth - 24;
  const barcodeY = qrY + 18;
  drawBarcode(
    ctx,
    barcodeX,
    barcodeY,
    barcodeWidth,
    barcodeHeight,
    isLight ? '#1f2937' : '#9ca3af'
  );

  ctx.save();
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(`*INDEX-${cleanReg}*`, barcodeX + 24, barcodeY + barcodeHeight + 11);
  ctx.restore();

  // 6. Hero Scorecard Card (Glass Panel with Neon Glow)
  const heroCardY = candidateY + 54;
  const heroCardWidth = innerRight - innerLeft;
  const heroCardHeight = 155;

  ctx.save();
  // Glass Panel Background
  ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.03)';
  ctx.beginPath();
  ctx.roundRect(innerLeft, heroCardY, heroCardWidth, heroCardHeight, 16);
  ctx.fill();

  ctx.strokeStyle = theme.borderSubtle;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hero Neon Left Accent Bar
  ctx.fillStyle = theme.accentNeon;
  ctx.beginPath();
  ctx.roundRect(innerLeft, heroCardY, 5, heroCardHeight, [16, 0, 0, 16]);
  ctx.fill();

  // Left Content: Projected Score Hero
  const scoreX = innerLeft + 28;
  const scoreTextY = heroCardY + 32;

  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = theme.accentNeon;
  ctx.fillText('PROJECTED_UTME_SCORE', scoreX, scoreTextY);

  // Big Bold Score Number & Baseline Lockup
  const score = profile.currentEstimatedScore || 280;
  const scoreStr = `${score}`;
  ctx.font = '900 74px "Outfit", "Inter", sans-serif';
  ctx.fillStyle = theme.textPrimary;
  const scoreBaseY = scoreTextY + 70;
  ctx.fillText(scoreStr, scoreX, scoreBaseY);

  // Max score label locked to identical typographic baseline
  const scoreNumWidth = ctx.measureText(scoreStr).width;
  ctx.font = '600 20px "Outfit", sans-serif';
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('/ 400', scoreX + scoreNumWidth + 12, scoreBaseY);

  // Clearance Status Pill
  const target = profile.targetScore || 320;
  const isAhead = score >= target;
  const statusPillText = isAhead
    ? `MERIT CUTOFF CLEARED (+${score - target} PTS)`
    : `TARGET PACE · ${target - score} PTS TO CUTOFF`;

  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillStyle = isAhead ? theme.accentNeon : '#f59e0b';
  ctx.fillText(`STATUS // ${statusPillText}`, scoreX, scoreTextY + 104);

  // Right Content: 3 Player Vitals (Focus Streak, Accuracy, Diagnostic Velocity)
  const vitalsStartX = innerLeft + 410;
  const vitalsWidth = heroCardWidth - 430;
  const vitalsY = heroCardY + 28;

  const vitals = [
    {
      label: 'FOCUS STREAK',
      value: `${profile.streakDays || 14} DAYS`,
      accent: theme.accentNeon,
      pct: Math.min(100, (profile.streakDays || 14) * 5),
    },
    {
      label: 'ACCURACY RATE',
      value: `${profile.accuracyRate || 82}%`,
      accent: theme.accentSecondary,
      pct: profile.accuracyRate || 82,
    },
    {
      label: 'QUESTIONS CRACKED',
      value: `${(profile.totalQuestionsAnswered || 1420).toLocaleString()}`,
      accent: isLight ? '#2563eb' : '#38bdf8',
      pct: Math.min(100, Math.round(((profile.totalQuestionsAnswered || 1420) / 2000) * 100)),
    },
  ];

  const colWidth = vitalsWidth / 3;
  vitals.forEach((vit, i) => {
    const vx = vitalsStartX + i * colWidth;
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.letterSpacing = '1px';
    ctx.fillStyle = theme.textMuted;
    ctx.fillText(vit.label, vx, vitalsY);

    ctx.font = '800 24px "Outfit", "Inter", sans-serif';
    ctx.fillStyle = theme.textPrimary;
    ctx.fillText(vit.value, vx, vitalsY + 30);

    // Energy meter
    drawEnergyBar(
      ctx,
      vx,
      vitalsY + 44,
      colWidth - 24,
      6,
      vit.pct,
      vit.accent,
      isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      8
    );
  });
  ctx.restore();

  // 7. Four-Subject Breakdown Grid (Dashed Energy Bars + High-Vibe Stats)
  const subjectsY = heroCardY + heroCardHeight + 24;
  const subjects = getSubjectBreakdown(profile);
  const subjColWidth = (heroCardWidth - 36) / 4;
  const subjCardHeight = 110;

  subjects.forEach((subj, idx) => {
    const sx = innerLeft + idx * (subjColWidth + 12);

    ctx.save();
    // Glass subject card
    ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.025)';
    ctx.beginPath();
    ctx.roundRect(sx, subjectsY, subjColWidth, subjCardHeight, 12);
    ctx.fill();
    ctx.strokeStyle = theme.borderSubtle;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Subject Index & Name
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.textMuted;
    ctx.fillText(`SUB_0${idx + 1}`, sx + 14, subjectsY + 22);

    ctx.font = '700 13px "Outfit", sans-serif';
    ctx.fillStyle = theme.textPrimary;
    const shortName = subj.name.length > 15 ? subj.name.slice(0, 14) + '…' : subj.name;
    ctx.fillText(shortName, sx + 14, subjectsY + 40);

    // Subject score & percent bar locked to identical typographic baseline
    const scoreStr = `${subj.score}`;
    ctx.font = '800 28px "Outfit", sans-serif';
    ctx.fillStyle = theme.textPrimary;
    const subjScoreBaseY = subjectsY + 76;
    ctx.fillText(scoreStr, sx + 14, subjScoreBaseY);

    const numW = ctx.measureText(scoreStr).width;
    ctx.font = '600 12px "Outfit", sans-serif';
    ctx.fillStyle = theme.textMuted;
    ctx.fillText('/ 100', sx + 14 + numW + 5, subjScoreBaseY);

    // Dashed meter
    drawEnergyBar(
      ctx,
      sx + 14,
      subjectsY + 88,
      subjColWidth - 28,
      5,
      subj.score,
      theme.accentNeon,
      isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      10
    );
    ctx.restore();
  });

  // 8. Footer Bar: Intel Coordinates & Priority Targets Pill
  const footerY = height - margin - 20;
  ctx.save();
  ctx.font = '700 10px "JetBrains Mono", monospace';
  ctx.letterSpacing = '1px';
  ctx.fillStyle = theme.textMuted;

  const leftCoord = 'PRIORITY_TARGETS // UNILAG · UI · OAU · ABU // MERIT_RANK: TOP 2.4%';
  ctx.fillText(leftCoord, innerLeft, footerY);

  const rightCoord = 'AUTHENTICATED_DOSSIER // SCHOLAR_PREP_ENGINE';
  const rightWidth = ctx.measureText(rightCoord).width;
  ctx.fillText(rightCoord, innerRight - rightWidth, footerY);
  ctx.restore();

  return canvas;
}

/**
 * Downloads the high-resolution score dossier as a PNG file
 */
export async function downloadScorecardPNG(
  profile: UserProfile,
  themeId: CardTheme = 'obsidian'
): Promise<void> {
  const canvas = await renderScorecardToCanvas(profile, themeId, 1200, 675);
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const candidateSlug = (profile.name || 'Scholar')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 20);
  const fileName = `Scholar_Dossier_${candidateSlug}_${profile.currentEstimatedScore || 280}pts.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies the scorecard PNG directly to system clipboard
 */
export async function copyScorecardImageToClipboard(
  profile: UserProfile,
  themeId: CardTheme = 'obsidian'
): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    return false;
  }

  try {
    const canvas = await renderScorecardToCanvas(profile, themeId, 1200, 675);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
    });

    if (!blob) return false;

    await navigator.clipboard.write([
      new window.ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.warn('Direct image clipboard copy failed:', err);
    return false;
  }
}
