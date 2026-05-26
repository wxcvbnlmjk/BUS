/** Extrait l'id arrêt depuis "ActIV:StopArea:SP:48190:SYTRAL" → 48190 */
export function parseDestinationStopId(destinationRef: string): number | null {
  const match = destinationRef.match(/ActIV:StopArea:SP:(\d+):/);
  return match ? Number.parseInt(match[1], 10) : null;
}
