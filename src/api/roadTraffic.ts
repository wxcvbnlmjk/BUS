import type {
  TrafficFeatureCollection,
  TrafficItemsResponse,
} from '../types/traffic';

const TRAFFIC_ITEMS_URL = '/api/traffic/items';
const PAGE_SIZE = 1000;

export async function fetchRoadTraffic(): Promise<TrafficFeatureCollection> {
  const features: TrafficFeatureCollection['features'] = [];
  let startIndex = 0;
  let total = Number.POSITIVE_INFINITY;

  while (startIndex < total) {
    const params = new URLSearchParams({
      f: 'application/json',
      sortby: 'gid',
      startIndex: String(startIndex),
      limit: String(PAGE_SIZE),
    });

    const response = await fetch(`${TRAFFIC_ITEMS_URL}?${params}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API trafic : ${response.status} ${response.statusText}`);
    }

    const page = (await response.json()) as TrafficItemsResponse;
    const batch = page.features ?? [];
    features.push(...batch);

    const matched = page.numberMatched ?? page.totalFeatures;
    if (matched != null) total = matched;

    if (batch.length === 0) break;
    startIndex += batch.length;
  }

  return { type: 'FeatureCollection', features };
}
