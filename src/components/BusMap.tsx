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

    <div style={{ position: 'relative', width: '100%', height: '100svh' }}>
      <a
        style={{ position: 'absolute', top: '12px', right: '260px', zIndex: 1000}}
        href="https://github.com/wxcvbnlmjk/BUS"
        target="_blank"
        rel="noreferrer"
      >
        <img
          alt="github BUS"
          src="https://img.shields.io/badge/github-BUS-blue?logo=github"
        />
      </a>

      <a
         style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000}}
        href="https://data.grandlyon.com/portail/fr/jeux-de-donnees/positions-en-temps-reel-des-vehicules-du-reseau-des-transports-en-commun-lyonnais/info"
        target="_blank"
        rel="noreferrer"
      >
        <img
          alt="Data Grand Lyon"
          src="https://img.shields.io/badge/Data_Grand_Lyon-Réseaux_de_transport-blue"
        />
      </a>

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
      <VehicleMarkers vehicles={vehicles} selectedLine={selectedLine} />
    </MapContainer>*
    </div>
  );
}
