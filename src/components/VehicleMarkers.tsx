import { useMemo, useState } from 'react';
import {
  CircleMarker,
  LayerGroup,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { BusVehicle } from '../types/siri';
import { sortLineNumbers } from '../utils/lineRef';
import { parseDelayLabelToSeconds } from '../utils/delay';
import { DELAY_COLORS, getDelayDotColor } from '../utils/delayColor';

const FULL_SCALE = 1;
const MIN_ZOOM_SCALE = 0.5;
const ZOOM_SCALE_MIN = 11;
const ZOOM_SCALE_MAX = 17;
/** En mode « Toutes », en dessous de ce zoom : uniquement des points rouges */
const ALL_MODE_DOT_MAX_ZOOM = 13;
const DOT_RADIUS_PX = 4;

/** Échelle 0.5 (dézoomé) → 1.0 (zoomé), uniquement en mode « Toutes » */
export function getZoomScale(zoom: number): number {
  const t = Math.min(
    1,
    Math.max(0, (zoom - ZOOM_SCALE_MIN) / (ZOOM_SCALE_MAX - ZOOM_SCALE_MIN)),
  );
  return MIN_ZOOM_SCALE + t * (FULL_SCALE - MIN_ZOOM_SCALE);
}

function getVehicleDelaySeconds(vehicle: BusVehicle): number | null {
  return vehicle.delaySeconds ?? parseDelayLabelToSeconds(vehicle.delayLabel);
}

function createVehicleIcon(
  lineNumber: string,
  bearing: number | undefined,
  scale: number,
  markerColor: string,
): L.DivIcon {
  const hasBearing = bearing != null;
  const rotation = hasBearing ? `transform: rotate(${bearing}deg);` : '';
  const pointerBorder = Math.max(4, Math.round(8 * scale));
  const pointerHeight = Math.max(7, Math.round(14 * scale));
  const pointer = hasBearing
    ? `<div class="bus-marker-pointer" style="margin-bottom:-${Math.max(1, Math.round(2 * scale))}px;border-left:${pointerBorder}px solid transparent;border-right:${pointerBorder}px solid transparent;border-bottom:${pointerHeight}px solid ${markerColor};" aria-hidden="true"></div>`
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
        <div class="bus-marker-label" style="background:${markerColor};color:#ffffff;width:${labelSize}px;height:${labelSize}px;font-size:${fontSize}px;border-width:${borderWidth}px;">${lineNumber}</div>
      </div>
    `,
    iconSize: [iconW, iconH],
    iconAnchor: [iconW / 2, anchorY],
    popupAnchor: [0, -anchorY],
  });
}

function coloredLabel(text: string, color: string) {
  return (
    <span style={{ color, fontWeight: 'bold' }}>{text}</span>
  );
}

function DelayColorLegend() {
  const c = DELAY_COLORS;
  return (
    <>
      <tr>
        <td colSpan={3}>{coloredLabel('Échelle de couleurs', c.black)}</td>
      </tr>
      <tr>
        <td colSpan={3}>{coloredLabel('En avance', c.blue)}</td>
      </tr>
      <tr>
        <td>{coloredLabel('Retard jusqu\'à 2 min', c.blue)}</td>
        <td>→</td>
        <td>{coloredLabel('vert', c.green)}</td>
      </tr>
      <tr>
        <td>{coloredLabel('Retard 2 min', c.green)}</td>
        <td>→</td>
        <td>{coloredLabel('4 min', c.yellow)}</td>
      </tr>
      <tr>
        <td>{coloredLabel('Retard 4 min', c.yellow)}</td>
        <td>→</td>
        <td>{coloredLabel('6 min', c.orange)}</td>
      </tr>
      <tr>
        <td>{coloredLabel('Retard 6 min', c.orange)}</td>
        <td>→</td>
        <td>{coloredLabel('10 min', c.red)}</td>
      </tr>
      <tr>
        <td colSpan={3}>{coloredLabel('Retard de plus de 10 min', c.black)}</td>
      </tr>
    </>
  );
}

function VehiclePopup({ vehicle }: { vehicle: BusVehicle }) {
  const delay = vehicle.delayLabel ?? '-';
  const isEarly = delay.slice(0, 1) === '-';
  return (
    <Popup>
      <table>
        <tbody>
          <tr>
            <td>
              <strong>Ligne {vehicle.lineNumber}</strong>
            </td>
            <td />
            <td />
          </tr>
          <tr>
            <td>Destination</td>
            <td />
            <td>{vehicle.destinationStopName ?? '-'}</td>
          </tr>
          <tr>
            <td>Arrêt</td>
            <td />
            <td>{vehicle.nextStopName ?? '-'}</td>
          </tr>
          <tr>
            <td>{isEarly ? 'Avance' : 'Retard'}</td>
            <td />
            <td>{isEarly ? delay.slice(1, 10) : delay}</td>
          </tr>
          <tr>
            <td colSpan={3}></td>
          </tr>
          <DelayColorLegend />
        </tbody>
      </table>
    </Popup>
  );
}

interface VehicleMarkersProps {
  vehicles: BusVehicle[];
  selectedLines: string[];
}

export function VehicleMarkers({
  vehicles,
  selectedLines,
}: VehicleMarkersProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useMapEvents({
    zoom: () => setZoom(map.getZoom()),
    zoomend: () => setZoom(map.getZoom()),
    zoomanim: () => setZoom(map.getZoom()),
    moveend: () => setZoom(map.getZoom()),
  });

  const showAll =
    selectedLines.includes('all') || selectedLines.length === 0;

  const normalizedSelectedLines = useMemo(() => {
    if (showAll) return ['all'];
    const unique = Array.from(new Set(selectedLines));
    unique.sort(sortLineNumbers);
    return unique;
  }, [selectedLines, showAll]);

  const markerScale = showAll ? getZoomScale(zoom) : FULL_SCALE;
  const useCompactDot = showAll && zoom < ALL_MODE_DOT_MAX_ZOOM;
  const scaleKey = showAll
    ? useCompactDot
      ? 'dot'
      : `full-${markerScale.toFixed(2)}`
    : 'full';

  const visibleVehicles = useMemo(() => {
    if (showAll) return vehicles;
    const selectedSet = new Set(normalizedSelectedLines);
    return vehicles.filter((v) => selectedSet.has(v.lineNumber));
  }, [vehicles, normalizedSelectedLines, showAll]);

  const getIcon = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    return (vehicle: BusVehicle) => {
      const bearingKey =
        vehicle.bearing != null ? Math.round(vehicle.bearing) : 'na';
      const markerColor = getDelayDotColor(getVehicleDelaySeconds(vehicle));
      const key = `${vehicle.lineNumber}-${bearingKey}-${scaleKey}-${markerColor}`;
      if (!cache.has(key)) {
        cache.set(
          key,
          createVehicleIcon(
            vehicle.lineNumber,
            vehicle.bearing,
            showAll ? markerScale : FULL_SCALE,
            markerColor,
          ),
        );
      }
      return cache.get(key)!;
    };
  }, [markerScale, scaleKey, showAll]);

  const selectionKey = normalizedSelectedLines.join(',');
  const layerKey = `${selectionKey}-${useCompactDot ? 'dots' : scaleKey}`;

  const getDotPathOptions = (vehicle: BusVehicle) => {
    const fillColor = getDelayDotColor(getVehicleDelaySeconds(vehicle));
    return {
      color: fillColor,
      fillColor,
      fillOpacity: 1,
      weight: 0,
    };
  };

  if (useCompactDot) {
    return (
      <LayerGroup key={layerKey}>
        {visibleVehicles.map((vehicle) => (
          <CircleMarker
            key={`${layerKey}-${vehicle.id}`}
            center={[vehicle.lat, vehicle.lng]}
            radius={DOT_RADIUS_PX}
            pathOptions={getDotPathOptions(vehicle)}
          >
            <VehiclePopup vehicle={vehicle} />
          </CircleMarker>
        ))}
      </LayerGroup>
    );
  }

  return (
    <LayerGroup key={layerKey}>
      {visibleVehicles.map((vehicle) => (
        <Marker
          key={`${layerKey}-${vehicle.id}`}
          position={[vehicle.lat, vehicle.lng]}
          icon={getIcon(vehicle)}
        >
          <VehiclePopup vehicle={vehicle} />
        </Marker>
      ))}
    </LayerGroup>
  );
}
