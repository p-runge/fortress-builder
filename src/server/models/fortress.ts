// TODO: link this to townhall level
export const FORTRESS_SIZE = 2; // radius of the fortress hexagon

export function getCoordinatesForSize(
  size: number,
): { x: number; y: number }[] {
  const coordinates = [];
  for (let q = -(size - 1); q <= size - 1; q++) {
    const r1 = Math.max(-(size - 1), -q - (size - 1));
    const r2 = Math.min(size - 1, -q + (size - 1));

    for (let r = r1; r <= r2; r++) {
      coordinates.push({ x: q, y: r });
    }
  }

  return coordinates;
}
