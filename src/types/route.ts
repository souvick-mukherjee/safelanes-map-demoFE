export type Coordinate = {
  lat: number;
  lng: number;
  score?: number;
};

export type RouteSegment = {
  positions: [number, number][];
  color: string;
  score: number;
  index: number;
};

// Function to get color based on safety score
export const getSafetyColor = (score: number): string => {
  if (score >= 8.0) return '#10b981'; // Green - Excellent
  if (score >= 6.0) return '#3b82f6'; // Blue - Good
  if (score >= 4.0) return '#f59e0b'; // Yellow - Moderate
  if (score >= 2.0) return '#ef4444'; // Red - Poor
  return '#7c2d12'; // Dark Red - Very Poor
};

// Function to get safety label
export const getSafetyLabel = (score: number): string => {
  if (score >= 8.0) return 'Excellent';
  if (score >= 6.0) return 'Good';
  if (score >= 4.0) return 'Moderate';
  if (score >= 2.0) return 'Poor';
  return 'Very Poor';
};

// Function to get safety class for styling
export const getSafetyClass = (score: number): string => {
  if (score >= 8.0) return 'safety-excellent';
  if (score >= 6.0) return 'safety-good';
  if (score >= 4.0) return 'safety-moderate';
  if (score >= 2.0) return 'safety-poor';
  return 'safety-very-poor';
};

// Function to calculate average safety score
export const calculateAverageSafety = (route: Coordinate[]): number => {
  if (route.length === 0) return 0;
  return route.reduce((sum, coord) => sum + (coord.score || 0), 0) / route.length;
};

// Function to get safety label for average score
export const getAverageSafetyLabel = (route: Coordinate[]): string => {
  const avgScore = calculateAverageSafety(route);
  return getSafetyLabel(avgScore);
};
