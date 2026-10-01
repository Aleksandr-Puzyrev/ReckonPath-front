const DEGREES_TO_RADIANS = Math.PI / 180;

// CSS angles: 0deg points up and 90deg points right, the line spans the box corner to corner (углы как в CSS: 0deg — вверх, 90deg — вправо).
export const gradientPoints = (angle: number, width: number, height: number) => {
  const radians = angle * DEGREES_TO_RADIANS;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  const half = (Math.abs(width * dx) + Math.abs(height * dy)) / 2;
  const center = { x: width / 2, y: height / 2 };
  return {
    start: { x: center.x - dx * half, y: center.y - dy * half },
    end: { x: center.x + dx * half, y: center.y + dy * half },
  };
};
