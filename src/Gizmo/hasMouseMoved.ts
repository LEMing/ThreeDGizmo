
export const hasMouseMoved = (
  startPosition: { x: number; y: number } | null,
  event: MouseEvent,
): boolean => {
  const MOVE_THRESHOLD = 5;
  if (!startPosition) return false;
  const dx = event.clientX - startPosition.x;
  const dy = event.clientY - startPosition.y;
  return dx * dx + dy * dy > MOVE_THRESHOLD * MOVE_THRESHOLD;
};
