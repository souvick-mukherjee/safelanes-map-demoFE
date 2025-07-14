import React, { useState } from "react";
import CoordinateForm from "./components/CoordinateForm";
import MapView from "./components/Mapview";
import type { Coordinate } from "./types/route";
import { getAverageSafetyLabel, getSafetyClass, calculateAverageSafety } from "./types/route";

const App: React.FC = () => {
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRouteReceived = (routeData: { lat: number; lng: number; score?: number }[]) => {
    setRoute(
      routeData.map(({ lat, lng, score }) => ({
        lat,
        lng,
        score,
      }))
    );
  };

  const averageSafetyLabel = route.length > 0 ? getAverageSafetyLabel(route) : '';
  const averageSafetyClass = route.length > 0 ? getSafetyClass(calculateAverageSafety(route)) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            🛡️ Safelanes
          </h1>
          <p className="text-white/90 text-lg md:text-xl">
            Find the safest walking routes to your destination
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Plan Your Route
              </h2>
              <CoordinateForm
                onRouteReceived={handleRouteReceived}
                onLoadingChange={setIsLoading}
              />
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Route Map
                </h2>
                {route.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {route.length} waypoints • 
                    <span className="ml-1">
                      Avg Safety: <span className={`font-medium ${averageSafetyClass}`}>{averageSafetyLabel}</span>
                    </span>
                  </div>
                )}
              </div>
              <MapView route={route} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Safety Legend */}
        {route.length > 0 && (
          <div className="mt-6">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Safety Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-green-500 rounded"></div>
                  <span>Excellent (0.8-1.0)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-blue-500 rounded"></div>
                  <span>Good (0.6-0.8)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-yellow-500 rounded"></div>
                  <span>Moderate (0.4-0.6)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-red-500 rounded"></div>
                  <span>Poor (0.2-0.4)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-red-800 rounded"></div>
                  <span>Very Poor (0.0-0.2)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
