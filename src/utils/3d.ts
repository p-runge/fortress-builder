const HEX_SIZE = 1;

// transform coordinates of hexagonal map to canvas coordinates
export function getCanvasPosition(
  q: number,
  r: number,
): [number, number, number] {
  const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
  const z = ((HEX_SIZE * 3) / 2) * r;
  return [x, 0, z];
}
