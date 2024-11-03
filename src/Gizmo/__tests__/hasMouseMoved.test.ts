// utils/hasMouseMoved.test.ts

import { hasMouseMoved } from '../hasMouseMoved';

describe('hasMouseMoved', () => {
  it('should return false if startPosition is null', () => {
    const startPosition = null;
    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });

    const result = hasMouseMoved(startPosition, event);
    expect(result).toBe(false);
  });

  it('should return false if mouse has not moved beyond the threshold', () => {
    const startPosition = { x: 100, y: 100 };
    const event = new MouseEvent('mousemove', { clientX: 102, clientY: 103 });

    const result = hasMouseMoved(startPosition, event);
    expect(result).toBe(false);
  });

  it('should return true if mouse has moved beyond the threshold', () => {
    const startPosition = { x: 100, y: 100 };
    const event = new MouseEvent('mousemove', { clientX: 110, clientY: 110 });

    const result = hasMouseMoved(startPosition, event);
    expect(result).toBe(true);
  });

  it('should return false if mouse has moved exactly at the threshold', () => {
    const startPosition = { x: 100, y: 100 };
    // MOVE_THRESHOLD inside function is 5
    // dx^2 + dy^2 = 25
    // Using dx = 3, dy = 4 (3^2 + 4^2 = 25)
    const event = new MouseEvent('mousemove', { clientX: 103, clientY: 104 });

    const result = hasMouseMoved(startPosition, event);
    expect(result).toBe(false); // Since 25 is not greater than 25
  });
});
