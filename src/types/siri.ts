export interface SiriVehicleMonitoringResponse {
  Siri: {
    ServiceDelivery: {
      ResponseTimestamp: string;
      VehicleMonitoringDelivery: Array<{
        VehicleActivity: VehicleActivity[];
      }>;
    };
  };
}

export interface VehicleActivity {
  VehicleMonitoringRef: { value: string };
  RecordedAtTime: string;
  MonitoredVehicleJourney: {
    LineRef: { value: string };
    DirectionRef?: { value: string };
    VehicleLocation: {
      Longitude: number;
      Latitude: number;
    };
    Bearing?: number;
    VehicleRef?: { value: string };
    DataSource?: string;
  };
}

export interface BusVehicle {
  id: string;
  lineNumber: string;
  lineRef: string;
  lat: number;
  lng: number;
  bearing?: number;
  direction?: string;
  recordedAt: string;
}
