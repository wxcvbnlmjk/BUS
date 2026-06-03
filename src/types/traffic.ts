import type { Feature, FeatureCollection, LineString } from 'geojson';

export interface TrafficSegmentProperties {
  twgid?: number;
  code?: string;
  libelle?: string;
  zoom?: number;
  nom_zoom?: string;
  sens?: string;
  longueur?: number;
  fournisseur?: string;
  etat?: string;
  vitesse?: string;
  gid?: number;
  last_update?: string;
  est_a_jour?: boolean;
}

export type TrafficFeature = Feature<LineString, TrafficSegmentProperties>;

export type TrafficFeatureCollection = FeatureCollection<
  LineString,
  TrafficSegmentProperties
>;

export interface TrafficItemsResponse extends TrafficFeatureCollection {
  numberMatched?: number;
  totalFeatures?: number;
  numberReturned?: number;
}
