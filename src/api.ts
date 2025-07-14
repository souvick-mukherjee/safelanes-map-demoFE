import type { Coordinate } from "./types/route";

// Mock API function for testing the UI
export const mockWalkingPathAPI = async (source: string, destination: string): Promise<Coordinate[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock route data with varying safety scores
  const mockRoute: Coordinate[] = [
    { lat: 42.3554, lng: -71.0656, score: 0.9 }, // Boston Common - Excellent
    { lat: 42.3600, lng: -71.0600, score: 0.7 }, // Good
    { lat: 42.3650, lng: -71.0550, score: 0.5 }, // Moderate
    { lat: 42.3700, lng: -71.0500, score: 0.3 }, // Poor
    { lat: 42.3750, lng: -71.0450, score: 0.8 }, // Good
    { lat: 42.3800, lng: -71.0400, score: 0.6 }, // Good
    { lat: 42.3850, lng: -71.0350, score: 0.4 }, // Moderate
    { lat: 42.3900, lng: -71.0300, score: 0.9 }, // Harvard - Excellent
  ];
  
  return mockRoute;
};

// Real API function (commented out for now)
export const fetchWalkingPath = async (source: string, destination: string): Promise<Coordinate[]> => {
  try {
    const response = await fetch("http://localhost:8085/api/walking-path", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source, destination }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    return data.map((coord: Coordinate) => ({
      lat: coord.lat,
      lng: coord.lng,
      score: coord.score,
    }));
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
