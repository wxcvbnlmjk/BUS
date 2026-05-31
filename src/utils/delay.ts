function parseSiriDurationToSeconds(delay: string): number | null {
  const match = delay.match(/^(-)?PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;

  const sign = match[1] ? -1 : 1;
  const hours = Number.parseInt(match[2] ?? '0', 10);
  const minutes = Number.parseInt(match[3] ?? '0', 10);
  const seconds = Number.parseInt(match[4] ?? '0', 10);
  return sign * (hours * 3600 + minutes * 60 + seconds);
}

/** Retard en secondes : négatif = avance, positif = retard */
export function parseSiriDelayToSeconds(delay?: string): number | null {
  if (!delay) return null;
  return parseSiriDurationToSeconds(delay);
}

/** Reparse le libellé affiché (ex. « -30s », « 1 min 15s ») */
export function parseDelayLabelToSeconds(label?: string): number | null {
  if (!label || label === '-') return null;

  const trimmed = label.trim();
  const isNegative = trimmed.startsWith('-');
  const rest = (isNegative ? trimmed.slice(1) : trimmed).trim();

  const minSec = rest.match(/^(\d+)\s*min\s*(\d+)s$/i);
  if (minSec) {
    const total = Number(minSec[1]) * 60 + Number(minSec[2]);
    return isNegative ? -total : total;
  }

  const onlySec = rest.match(/^(\d+)s$/i);
  if (onlySec) {
    const total = Number(onlySec[1]);
    return isNegative ? -total : total;
  }

  return null;
}

export function formatSiriDelay(delay?: string): string | undefined {
  if (!delay) return undefined;
  const totalSeconds = parseSiriDurationToSeconds(delay);
  if (totalSeconds == null) return delay;

  const absSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;
  const signLabel = totalSeconds < 0 ? '-' : '';

  if (minutes > 0) return `${signLabel}${minutes} min ${seconds}s`;
  return `${signLabel}${seconds}s`;
}
