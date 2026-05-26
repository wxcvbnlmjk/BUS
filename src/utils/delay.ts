function parseSiriDurationToSeconds(delay: string): number | null {
  const match = delay.match(/^(-)?PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;

  const sign = match[1] ? -1 : 1;
  const hours = Number.parseInt(match[2] ?? '0', 10);
  const minutes = Number.parseInt(match[3] ?? '0', 10);
  const seconds = Number.parseInt(match[4] ?? '0', 10);
  return sign * (hours * 3600 + minutes * 60 + seconds);
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
