import { getArretsIndex, getStopName } from './arrets';
import type { BusVehicle, SiriVehicleMonitoringResponse } from '../types/siri';
import { formatSiriDelay, parseSiriDelayToSeconds } from '../utils/delay';
import { parseLineNumber } from '../utils/lineRef';

const API_URL = '/api/siri/vehicle-monitoring.json';

export async function fetchVehicles(): Promise<BusVehicle[]> {
  // const dataUrl = import.meta.env.PROD ? API_URL : 'all.json';
  const dataUrl = API_URL;
  
  const [response, arrets] = await Promise.all([
    fetch(dataUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }),
    getArretsIndex(),
  ]);
  if (!response.ok) {
    throw new Error(`API SIRI : ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as SiriVehicleMonitoringResponse;
  const deliveries = data.Siri?.ServiceDelivery?.VehicleMonitoringDelivery ?? [];
  const activities = deliveries.flatMap((d) => d.VehicleActivity ?? []);

  const vehicles: BusVehicle[] = [];

  for (const activity of activities) {
    const journey = activity.MonitoredVehicleJourney;
    const loc = journey?.VehicleLocation;
    const lineRef = journey?.LineRef?.value;
    if (!loc || !lineRef) continue;

    const lineNumber = parseLineNumber(lineRef);
    vehicles.push({
      id:
        activity.VehicleMonitoringRef?.value ??
        `${lineNumber}-${loc.Latitude}-${loc.Longitude}`,
      lineNumber,
      lineRef,
      lat: loc.Latitude,
      lng: loc.Longitude,
      bearing: journey.Bearing,
      destinationStopName: getStopName(
        arrets,
        journey.DestinationRef?.value,
      ),
      nextStopName: getStopName(
        arrets,
        journey.MonitoredCall?.StopPointRef?.value,
      ),
      delayLabel: formatSiriDelay(journey.Delay),
      delaySeconds: parseSiriDelayToSeconds(journey.Delay) ?? undefined,
      recordedAt: activity.RecordedAtTime,
    });
  }

  return vehicles;
}
