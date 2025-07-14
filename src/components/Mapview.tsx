import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import type { Coordinate } from "../types/route";
import { getSafetyColor, getSafetyLabel } from "../types/route";

// Fix marker icon issue in Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

type MapViewProps = {
  route: Coordinate[];
  isLoading: boolean;
};

// Custom icons for start and end markers
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const FitBounds: React.FC<{ route: Coordinate[] }> = ({ route }) => {
  const map = useMap();

  useEffect(() => {
    if (route.length > 0) {
      const validCoords = route.filter(coord => 
        typeof coord.lat === 'number' && typeof coord.lng === 'number'
      );
      
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords.map(coord => [coord.lat, coord.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [route, map]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({ route, isLoading }) => {
  // Debug logging
  console.log('MapView - route:', route);
  console.log('MapView - route length:', route.length);
  if (route.length > 0) {
    console.log('MapView - first coordinate:', route[0]);
    console.log('MapView - last coordinate:', route[route.length - 1]);
  }

  const center: [number, number] = useMemo(() => {
    if (route.length > 0 && 
        typeof route[0].lat === 'number' && 
        typeof route[0].lng === 'number') {
      return [route[0].lat, route[0].lng];
    }
    return [42.3554, -71.0656]; // Default: Boston
  }, [route]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Finding the safest route...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer 
        center={center}
        zoom={13}
        scrollWheelZoom
        style={{ height: "60vh", width: "100%", borderRadius: "8px" }}
        className="shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {route.length > 0 && (
          <>
            {/* Route segments */}
            {route.length > 1 &&
              route.slice(0, -1).map((coord, idx) => {
                const nextCoord = route[idx + 1];

                // Validate coordinates
                if (
                  typeof coord.lat !== "number" || typeof coord.lng !== "number" ||
                  typeof nextCoord.lat !== "number" || typeof nextCoord.lng !== "number"
                ) return null;

                return (
                  <Polyline
                    key={idx}
                    positions={[
                      [coord.lat, coord.lng],
                      [nextCoord.lat, nextCoord.lng],
                    ]}
                    color={getSafetyColor(coord.score || 0)}
                    weight={6}
                    opacity={0.8}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="text-sm">
                          Segment Safety: <span className="font-medium">
                            {getSafetyLabel(coord.score || 0)}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          ({Math.round((coord.score || 0) * 100)}%)
                        </p>
                      </div>
                    </Popup>
                  </Polyline>
                );
              })}

            {/* Start marker - only render if coordinates are valid */}
            {typeof route[0].lat === 'number' && typeof route[0].lng === 'number' && (
              <Marker 
                position={[route[0].lat, route[0].lng]} 
                icon={createCustomIcon('#10b981')}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-green-600">🚶‍♂️ Starting Point</h3>
                    <p className="text-sm text-gray-600">
                      Safety: {route[0].score !== undefined ? getSafetyLabel(route[0].score!) : 'Unknown'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* End marker - only render if coordinates are valid */}
            {typeof route[route.length - 1].lat === 'number' && typeof route[route.length - 1].lng === 'number' && (
              <Marker 
                position={[route[route.length - 1].lat, route[route.length - 1].lng]} 
                icon={createCustomIcon('#ef4444')}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-red-600">🎯 Destination</h3>
                    <p className="text-sm text-gray-600">
                      Safety: {getSafetyLabel(route[route.length - 1].score ?? 0)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            <FitBounds route={route} />
          </>
        )}
      </MapContainer>

      {/* Route info overlay */}
      {route.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
          <h4 className="font-semibold text-gray-800 mb-2">Route Summary</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Distance:</span> {route.length} waypoints</p>
            <p><span className="font-medium">Avg Safety:</span> {
              (() => {
                const avgScore = route.reduce((sum, coord) => sum + (coord.score || 0), 0) / route.length;
                if (avgScore >= 8.0) return <span className="safety-excellent">Excellent</span>;
                if (avgScore >= 6.0) return <span className="safety-good">Good</span>;
                if (avgScore >= 4.0) return <span className="safety-moderate">Moderate</span>;
                if (avgScore >= 2.0) return <span className="safety-poor">Poor</span>;
                return <span className="safety-very-poor">Very Poor</span>;
              })()
            }</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
