import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BusVehicle } from '../types/siri';

const LYON_CENTER: [number, number] = [45.764, 4.835];
const DEFAULT_ZOOM = 12;
const LINE_ZOOM = 15;

interface MapViewControllerProps {
  vehicles: BusVehicle[];
  selectedLines: string[];
}

export function MapViewController({
  vehicles,
  selectedLines,
}: MapViewControllerProps) {
  const map = useMap();
  const showAll =
    selectedLines.includes('all') || selectedLines.length === 0;

  useEffect(() => {
    if (!showAll) return;
    map.flyTo(LYON_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  }, [map, showAll]);

  useEffect(() => {
    if (showAll || vehicles.length === 0) return;

    if (vehicles.length === 1) {
      const bus = vehicles[0];
      map.flyTo([bus.lat, bus.lng], LINE_ZOOM, { duration: 0.8 });
      return;
    }

    const bounds = L.latLngBounds(
      vehicles.map((v) => [v.lat, v.lng] as [number, number]),
    );
    map.flyToBounds(bounds, {
      padding: [48, 48],
      duration: 0.8,
      maxZoom: LINE_ZOOM,
    });
  }, [map, showAll, vehicles]);

  return null;
}
