const DOT_BLUE     = '#003da5';
const DOT_GREEN    = '#16a34a';
const DOT_YELLOW   = '#eab308';
const DOT_ORANGE   = '#f97316';
const DOT_RED      = '#c8102e';
const DOT_RED_DARK = '#690010';

export const DELAY_COLORS = {
  blue: DOT_BLUE,
  green: DOT_GREEN,
  yellow: DOT_YELLOW,
  orange: DOT_ORANGE,
  red: DOT_RED,
  redDark: DOT_RED_DARK,
} as const;function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((c) => Math.round(c).toString(16).padStart(2, '0'))
    .join('')}`;
}

function lerpColor(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const ratio = clamp01(t);
  return rgbToHex(
    a.r + (b.r - a.r) * ratio,
    a.g + (b.g - a.g) * ratio,
    a.b + (b.b - a.b) * ratio,
  );
}

/** Couleur selon avance/retard (secondes : négatif = avance) — points et marqueurs */
export function getDelayDotColor(delaySeconds: number | null | undefined): string {
  if (delaySeconds == null) return DOT_BLUE;

  // Avance → retard 10 s : bleu
  if (delaySeconds <= 10) return DOT_BLUE;

  // Retard 10 s → 1 min : bleu → vert
  if (delaySeconds <= 60) {
    return lerpColor(DOT_BLUE, DOT_GREEN, (delaySeconds - 10) / 50);
  }

  // Retard 1 min → 1 min 30 s : vert → jaune
  if (delaySeconds <= 90) {
    return lerpColor(DOT_GREEN, DOT_YELLOW, (delaySeconds - 60) / 30);
  }

  // Retard 1 min 30 s → 2 min : jaune → orange
  if (delaySeconds <= 120) {
    return lerpColor(DOT_YELLOW, DOT_ORANGE, (delaySeconds - 90) / 30);
  }

  // Retard 2 min → 2 min 30 s : orange → rouge
  if (delaySeconds <= 150) {
    return lerpColor(DOT_ORANGE, DOT_RED, (delaySeconds - 120) / 30);
  }

  // Retard > 2 min 30 s : rouge
  return DOT_RED_DARK;
}
