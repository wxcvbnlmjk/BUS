import { useEffect, useMemo, useState } from 'react';
import { LayerGroup, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BusVehicle } from '../types/siri';

const FULL_SCALE = 1;
const MIN_ZOOM_SCALE = 0.5;
const ZOOM_SCALE_MIN = 11;
const ZOOM_SCALE_MAX = 17;

/** Échelle 0.5 (dézoomé) → 1.0 (zoomé), uniquement en mode « Toutes » */
export function getZoomScale(zoom: number): number {
  const t = Math.min(
    1,
    Math.max(0, (zoom - ZOOM_SCALE_MIN) / (ZOOM_SCALE_MAX - ZOOM_SCALE_MIN)),
  );
  return MIN_ZOOM_SCALE + t * (FULL_SCALE - MIN_ZOOM_SCALE);
}

function createVehicleIcon(
  lineNumber: string,
  bearing: number | undefined,
  scale: number,
): L.DivIcon {
  const hasBearing = bearing != null;
  const rotation = hasBearing ? `transform: rotate(${bearing}deg);` : '';
  const pointerBorder = Math.max(4, Math.round(8 * scale));
  const pointerHeight = Math.max(7, Math.round(14 * scale));
  const pointer = hasBearing
    ? `<div class="bus-marker-pointer" style="margin-bottom:-${Math.max(1, Math.round(2 * scale))}px;border-left:${pointerBorder}px solid transparent;border-right:${pointerBorder}px solid transparent;border-bottom:${pointerHeight}px solid #c8102e;" aria-hidden="true"></div>`
    : '';

  const labelSize = Math.max(16, Math.round(32 * scale));
  const fontSize = Math.max(8, Math.round(12 * scale));
  const borderWidth = scale < 0.75 ? 1 : 2;
  const iconW = Math.max(20, Math.round(40 * scale));
  const iconH = Math.max(18, Math.round((hasBearing ? 48 : 36) * scale));
  const anchorY = Math.max(9, Math.round((hasBearing ? 28 : 18) * scale));
  const originY = anchorY;

  return L.divIcon({
    className: 'bus-marker',
    html: `
      <div class="bus-marker-oriented" style="${rotation} transform-origin:${iconW / 2}px ${originY}px;">
        ${pointer}
        <div class="bus-marker-label" style="color:#ffffff;width:${labelSize}px;height:${labelSize}px;font-size:${fontSize}px;border-width:${borderWidth}px;">${lineNumber}</div>
      </div>
    `,
    iconSize: [iconW, iconH],
    iconAnchor: [iconW / 2, anchorY],
    popupAnchor: [0, -anchorY],
  });
}

interface VehicleMarkersProps {
  vehicles: BusVehicle[];
  selectedLine: string;
}

export function VehicleMarkers({ vehicles, selectedLine }: VehicleMarkersProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const showAll = selectedLine === 'all';

  useEffect(() => {
    const updateZoom = () => setZoom(map.getZoom());
    map.on('zoom', updateZoom);
    map.on('zoomend', updateZoom);
    return () => {
      map.off('zoom', updateZoom);
      map.off('zoomend', updateZoom);
    };
  }, [map]);

  const markerScale = showAll ? getZoomScale(zoom) : FULL_SCALE;
  const scaleKey = showAll ? markerScale.toFixed(2) : 'full';

  const visibleVehicles = useMemo(() => {
    if (showAll) return vehicles;
    return vehicles.filter((v) => v.lineNumber === selectedLine);
  }, [vehicles, selectedLine, showAll]);

  const getIcon = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    return (vehicle: BusVehicle) => {
      const bearingKey =
        vehicle.bearing != null ? Math.round(vehicle.bearing) : 'na';
      const key = `${vehicle.lineNumber}-${bearingKey}-${scaleKey}`;
      if (!cache.has(key)) {
        cache.set(
          key,
          createVehicleIcon(vehicle.lineNumber, vehicle.bearing, markerScale),
        );
      }
      return cache.get(key)!;
    };
  }, [markerScale, scaleKey]);

  return (
    <LayerGroup key={selectedLine}>
      {visibleVehicles.map((vehicle) => (
        <Marker
          key={`${selectedLine}-${scaleKey}-${vehicle.id}`}
          position={[vehicle.lat, vehicle.lng]}
          icon={getIcon(vehicle)}
        >
          <Popup>
            <table>
              <tbody>
                <tr>
                  <td><strong>Ligne {vehicle.lineNumber}</strong></td>
                  <td />
                </tr>
                <tr>
                  <td>Destination</td>
                  <td>{vehicle.destinationStopName ?? '-'}</td>
                </tr>
                <tr>
                  <td>Arrêt</td>
                  <td>{vehicle.nextStopName ?? '-'}</td>
                </tr>
                <tr>
                  <td>{(vehicle.delayLabel ?? '-').slice(0,1)==="-" ? 'Avance': 'Retard'}</td>
                  <td>{vehicle.delayLabel ?? '-'}</td>
                </tr>
              </tbody>
            </table>
          </Popup>
        </Marker>
      ))}
    </LayerGroup>
  );
}
