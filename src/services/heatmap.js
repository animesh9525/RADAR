export const heatmapColors = ['#dcfce7', '#86efac', '#22c55e', '#15803d'];
export const heatmapLevelNames = ['Low', 'Medium', 'High', 'Very High'];
export const heatmapProfiles = {
  C1: [1, 1, 1, 1, 1, 1, 2, 2, 4, 4, 3, 2, 2, 2, 2, 3, 3, 4, 4, 3, 2, 2, 1, 1],
  C2: [1, 1, 1, 1, 1, 2, 2, 3, 4, 3, 2, 2, 2, 2, 3, 3, 4, 4, 3, 2, 2, 1, 1, 1],
  C3: [1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 4, 3, 3, 2, 2, 3, 3, 3, 2, 2, 1, 1, 1, 1],
  C4: [1, 1, 1, 1, 1, 2, 3, 4, 3, 2, 2, 2, 2, 2, 2, 3, 3, 4, 4, 3, 2, 1, 1, 1],
};
export function getHeatmapLevel(corridor, hour) {
  return (heatmapProfiles[corridor] || [])[hour] || 1;
}