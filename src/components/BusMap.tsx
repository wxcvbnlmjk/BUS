import { MapContainer, TileLayer } from 'react-leaflet';
import { MapViewController } from './MapViewController';
import { VehicleMarkers } from './VehicleMarkers';
import type { BusVehicle } from '../types/siri';

const LYON_CENTER: [number, number] = [45.764, 4.835];
const DEFAULT_ZOOM = 12;

interface BusMapProps {
  vehicles: BusVehicle[];
  selectedLine: string;
}

export function BusMap({ vehicles, selectedLine }: BusMapProps) {
  return (
    <MapContainer
      center={LYON_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewController vehicles={vehicles} selectedLine={selectedLine} />
      <VehicleMarkers vehicles={vehicles} />
    </MapContainer>
  );
}
