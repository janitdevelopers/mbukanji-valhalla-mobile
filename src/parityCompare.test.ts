import { describe, it, expect } from 'vitest';
import { compareWithinTolerance } from './parityCompare.js';
import type { ValhallaRouteResult } from './types.js';

describe('parityCompare', () => {
  const webResult: ValhallaRouteResult = {
    path: [
      [9.24, 4.15],
      [9.245, 4.155],
      [9.25, 4.16],
    ],
    distance: 5000,
    duration: 600,
    maneuvers: [],
  };

  it('passes when mobile matches web within default tolerance', () => {
    const mobile: ValhallaRouteResult = {
      path: [
        [9.24, 4.15],
        [9.245, 4.155],
        [9.25, 4.16],
      ],
      distance: 5010,
      duration: 605,
    };
    const r = compareWithinTolerance(webResult, mobile);
    expect(r.pass).toBe(true);
    expect(r.distancePass).toBe(true);
    expect(r.durationPass).toBe(true);
    expect(r.shapePass).toBe(true);
  });

  it('fails when distance exceeds tolerance', () => {
    const mobile: ValhallaRouteResult = {
      path: webResult.path,
      distance: webResult.distance + 100,
      duration: webResult.duration,
    };
    const r = compareWithinTolerance(webResult, mobile, { distanceMeters: 25 });
    expect(r.pass).toBe(false);
    expect(r.distancePass).toBe(false);
  });

  it('fails when shape deviation exceeds tolerance', () => {
    const mobile: ValhallaRouteResult = {
      path: [
        [9.24, 4.15],
        [9.26, 4.18],
        [9.25, 4.16],
      ],
      distance: 5000,
      duration: 600,
    };
    const r = compareWithinTolerance(webResult, mobile, { shapeMaxDeviationMeters: 1 });
    expect(r.pass).toBe(false);
    expect(r.shapePass).toBe(false);
  });

  it('uses custom tolerance', () => {
    const mobile: ValhallaRouteResult = {
      path: webResult.path,
      distance: webResult.distance + 50,
      duration: webResult.duration,
    };
    const r = compareWithinTolerance(webResult, mobile, { distanceMeters: 100 });
    expect(r.pass).toBe(true);
    expect(r.distancePass).toBe(true);
  });
});
