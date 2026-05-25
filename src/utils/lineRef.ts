/** Extrait le numéro de ligne depuis "ActIV:Line::52:SYTRAL" → "52" */
export function parseLineNumber(lineRef: string): string {
  const match = lineRef.match(/ActIV:Line::([^:]+):/);
  if (match?.[1]) return match[1];
  const parts = lineRef.split('::');
  return parts.length >= 3 ? parts[2] : lineRef;
}

export function sortLineNumbers(a: string, b: string): number {
  const numA = parseInt(a.replace(/\D/g, ''), 10);
  const numB = parseInt(b.replace(/\D/g, ''), 10);
  const bothNumeric = !Number.isNaN(numA) && !Number.isNaN(numB);
  if (bothNumeric && a.replace(/\D/g, '') === a && b.replace(/\D/g, '') === b) {
    return numA - numB;
  }
  return a.localeCompare(b, 'fr', { numeric: true });
}
