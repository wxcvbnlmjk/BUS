import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { BusVehicle } from '../types/siri';

function createLineIcon(lineNumber: string): L.DivIcon {
  return L.divIcon({
    className: 'bus-marker',
    html: `<div class="bus-marker-label" style="color:#ffffff">${lineNumber}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

interface VehicleMarkersProps {
  vehicles: BusVehicle[];
}

export function VehicleMarkers({ vehicles }: VehicleMarkersProps) {
  const icons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    return (line: string) => {
      if (!cache.has(line)) cache.set(line, createLineIcon(line));
      return cache.get(line)!;
    };
  }, []);

  return (
    <>
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          position={[vehicle.lat, vehicle.lng]}
          icon={icons(vehicle.lineNumber)}
        >
          <Popup>
            <strong>Ligne {vehicle.lineNumber}</strong>
            <br />
            {vehicle.direction === 'inbound' ? 'Direction aller' : vehicle.direction === 'outbound' ? 'Direction retour' : ''}
            {vehicle.bearing != null && (
              <>
                <br />
                Cap : {vehicle.bearing}°
              </>
            )}
            <br />
            <small>
              {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}
            </small>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
