const DOT_BLUE = '#003da5';
const DOT_GREEN = '#16a34a';
const DOT_YELLOW = '#eab308';
const DOT_ORANGE = '#f97316';
const DOT_RED = '#c8102e';
const DOT_BLACK = '#000000';

export const DELAY_COLORS = {
  blue: DOT_BLUE,
  green: DOT_GREEN,
  yellow: DOT_YELLOW,
  orange: DOT_ORANGE,
  red: DOT_RED,
  black: DOT_BLACK,
} as const;

function clamp01(value: number): number {
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
export function getDelayDotColor(
  delaySeconds: number | null | undefined,
): string {
  if (delaySeconds == null) return DOT_BLUE;

  // En avance : bleu
  if (delaySeconds < 0) return DOT_BLUE;

  // Retard jusqu'à 2 min : bleu → vert
  if (delaySeconds <= 120) {
    return lerpColor(DOT_BLUE, DOT_GREEN, delaySeconds / 120);
  }

  // Retard 2 min → 4 min : vert → jaune
  if (delaySeconds <= 240) {
    return lerpColor(DOT_GREEN, DOT_YELLOW, (delaySeconds - 120) / 120);
  }

  // Retard 4 min → 6 min : jaune → orange
  if (delaySeconds <= 360) {
    return lerpColor(DOT_YELLOW, DOT_ORANGE, (delaySeconds - 240) / 120);
  }

  // Retard 6 min → 10 min : orange → rouge
  if (delaySeconds <= 600) {
    return lerpColor(DOT_ORANGE, DOT_RED, (delaySeconds - 360) / 240);
  }

  // Retard > 10 min : noir
  return DOT_BLACK;
}
