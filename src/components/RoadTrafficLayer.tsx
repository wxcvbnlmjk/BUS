import { useCallback, useEffect, useMemo, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import type { Layer, PathOptions } from 'leaflet';
import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { fetchRoadTraffic } from '../api/roadTraffic';
import type { TrafficFeatureCollection, TrafficSegmentProperties } from '../types/traffic';
import {
  getTrafficEtatColor,
  getTrafficEtatLabel,
  isTrafficEtatVisible,
} from '../utils/trafficColor';

const TRAFFIC_POLL_MS = 60_000;

export function RoadTrafficLayer() {
  const map = useMap();
  const [data, setData] = useState<TrafficFeatureCollection | null>(null);

  const loadTraffic = useCallback(async () => {
    try {
      const geojson = await fetchRoadTraffic();
      setData({
        ...geojson,
        features: geojson.features.filter((f) =>
          isTrafficEtatVisible(f.properties?.etat),
        ),
      });
    } catch {
      // Échec silencieux : la carte reste utilisable sans trafic
    }
  }, []);

  useEffect(() => {
    void loadTraffic();
    const interval = setInterval(() => void loadTraffic(), TRAFFIC_POLL_MS);
    return () => clearInterval(interval);
  }, [loadTraffic]);

  const layerKey = useMemo(() => {
    if (!data?.features.length) return 'traffic-empty';
    const first = data.features[0]?.properties?.last_update ?? '';
    return `traffic-${data.features.length}-${first}`;
  }, [data]);

  const styleFeature = useCallback(
    (feature?: Feature<Geometry, GeoJsonProperties>): PathOptions => {
      const etat = (feature?.properties as TrafficSegmentProperties | null)?.etat;
      return {
        color: getTrafficEtatColor(etat),
        weight: 4,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      };
    },
    [],
  );

  const onEachFeature = useCallback(
    (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
      const p = feature.properties as TrafficSegmentProperties | null;
      const etat = getTrafficEtatLabel(p?.etat);
      const vitesse = p?.vitesse?.trim() || '—';
      const maj = p?.last_update
        ? new Date(p.last_update).toLocaleString('fr-FR')
        : '—';

      layer.bindPopup(
        `<strong>${p?.libelle ?? 'Tronçon'}</strong><br/>
        État : ${etat}<br/>
        Vitesse : ${vitesse}<br/>
        MAJ : ${maj}`,
      );
    },
    [],
  );

  if (!data?.features.length) return null;

  return (
    <GeoJSON
      key={layerKey}
      data={data}
      style={styleFeature}
      onEachFeature={onEachFeature}
      pane="overlayPane"
      eventHandlers={{
        add: (e) => {
          e.target.bringToBack();
          map.getPane('overlayPane')?.classList.add('road-traffic-pane');
        },
      }}
    />
  );
}
