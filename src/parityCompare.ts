/**
 * Compare mobile vs Web WASM route output within tolerance (Phase 2.4).
 * Used by parity test suite and CI.
 */

import type { ValhallaRouteResult } from './types.js';

export interface Tolerance {
  distanceMeters?: number;
  distancePercent?: number;
  durationSeconds?: number;
  durationPercent?: number;
  shapeMaxDeviationMeters?: number;
  shapeMinSampledPoints?: number;
}

export interface ParityResult {
  pass: boolean;
  distancePass: boolean;
  durationPass: boolean;
  shapePass: boolean;
  message?: string;
}

const DEFAULT_TOLERANCE: Tolerance = {
  distanceMeters: 25,
  distancePercent: 1,
  durationSeconds: 5,
  durationPercent: 2,
  shapeMaxDeviationMeters: 15,
  shapeMinSampledPoints: 50,
};

function samplePath(path: [number, number][], n: number): [number, number][] {
  if (path.length <= n) return path;
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor((i / (n - 1)) * (path.length - 1));
    out.push(path[Math.min(idx, path.length - 1)]);
  }
  return out;
}

function pointToSegmentDistance(
  p: [number, number],
  a: [number, number],
  b: [number, number]
): number {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy) || 1e-10;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (len * len)));
  const qx = ax + t * dx;
  const qy = ay + t * dy;
  return Math.sqrt((px - qx) ** 2 + (py - qy) ** 2) * 111320 * Math.cos((py * Math.PI) / 180);
}

function maxShapeDeviationMeters(
  pathA: [number, number][],
  pathB: [number, number][],
  nSample: number
): number {
  const sa = samplePath(pathA, nSample);
  const sb = samplePath(pathB, nSample);
  let max = 0;
  for (const p of sa) {
    let minD = Infinity;
    for (let i = 0; i < sb.length - 1; i++) {
      const d = pointToSegmentDistance(p, sb[i], sb[i + 1]);
      if (d < minD) minD = d;
    }
    if (sb.length === 1) minD = Math.sqrt((p[0] - sb[0][0]) ** 2 + (p[1] - sb[0][1]) ** 2) * 111320 * Math.cos((p[1] * Math.PI) / 180);
    if (minD !== Infinity && minD > max) max = minD;
  }
  for (const p of sb) {
    let minD = Infinity;
    for (let i = 0; i < sa.length - 1; i++) {
      const d = pointToSegmentDistance(p, sa[i], sa[i + 1]);
      if (d < minD) minD = d;
    }
    if (sa.length === 1) minD = Math.sqrt((p[0] - sa[0][0]) ** 2 + (p[1] - sa[0][1]) ** 2) * 111320 * Math.cos((p[1] * Math.PI) / 180);
    if (minD !== Infinity && minD > max) max = minD;
  }
  return max;
}

export function compareWithinTolerance(
  web: ValhallaRouteResult,
  mobile: ValhallaRouteResult,
  tolerance: Tolerance = {}
): ParityResult {
  const t = { ...DEFAULT_TOLERANCE, ...tolerance };
  let distancePass = true;
  let durationPass = true;
  let shapePass = true;
  const msg: string[] = [];

  const distDiff = Math.abs(mobile.distance - web.distance);
  if (t.distanceMeters != null && distDiff > t.distanceMeters) {
    distancePass = false;
    msg.push(`distance diff ${distDiff.toFixed(0)}m > ${t.distanceMeters}m`);
  }
  if (t.distancePercent != null && web.distance > 0) {
    const pct = (distDiff / web.distance) * 100;
    if (pct > t.distancePercent) {
      distancePass = false;
      msg.push(`distance diff ${pct.toFixed(2)}% > ${t.distancePercent}%`);
    }
  }

  if (web.duration != null && mobile.duration != null) {
    const durDiff = Math.abs(mobile.duration - web.duration);
    if (t.durationSeconds != null && durDiff > t.durationSeconds) {
      durationPass = false;
      msg.push(`duration diff ${durDiff.toFixed(1)}s > ${t.durationSeconds}s`);
    }
    if (t.durationPercent != null && web.duration > 0) {
      const pct = (durDiff / web.duration) * 100;
      if (pct > t.durationPercent) {
        durationPass = false;
        msg.push(`duration diff ${pct.toFixed(2)}% > ${t.durationPercent}%`);
      }
    }
  }

  const nSample = t.shapeMinSampledPoints ?? 50;
  const maxDev = maxShapeDeviationMeters(web.path, mobile.path, nSample);
  if (t.shapeMaxDeviationMeters != null && maxDev > t.shapeMaxDeviationMeters) {
    shapePass = false;
    msg.push(`shape max deviation ${maxDev.toFixed(0)}m > ${t.shapeMaxDeviationMeters}m`);
  }

  const pass = distancePass && durationPass && shapePass;
  return {
    pass,
    distancePass,
    durationPass,
    shapePass,
    message: msg.length ? msg.join('; ') : undefined,
  };
}
