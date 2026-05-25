import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BusVehicle } from '../types/siri';

const LYON_CENTER: [number, number] = [45.764, 4.835];
const DEFAULT_ZOOM = 12;
const LINE_ZOOM = 15;

interface MapViewControllerProps {
  vehicles: BusVehicle[];
  selectedLine: string;
}

export function MapViewController({
  vehicles,
  selectedLine,
}: MapViewControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedLine !== 'all') return;
    map.flyTo(LYON_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  }, [map, selectedLine]);

  useEffect(() => {
    if (selectedLine === 'all' || vehicles.length === 0) return;

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
  }, [map, selectedLine, vehicles]);

  return null;
}
