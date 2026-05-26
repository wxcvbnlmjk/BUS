import { parseDestinationStopId } from '../utils/destinationRef';

interface ArretsResponse {
  values: Array<{ id: number; nom: string }>;
}

let arretsIndex: Map<number, string> | null = null;

export async function getArretsIndex(): Promise<Map<number, string>> {
  if (arretsIndex) return arretsIndex;

  const response = await fetch('/arrets.json');
  if (!response.ok) {
    throw new Error(`Arrêts : ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ArretsResponse;
  arretsIndex = new Map(
    data.values.map((arret) => [arret.id, arret.nom]),
  );
  return arretsIndex;
}

export function getStopName(
  arrets: Map<number, string>,
  destinationRef?: string,
): string | undefined {
  if (!destinationRef) return undefined;
  const stopId = parseDestinationStopId(destinationRef);
  if (stopId == null) return undefined;
  return arrets.get(stopId);
}
