/**
 * Normalize native route JSON to canonical ValhallaRouteResult.
 * Native may return Valhalla trip format; we map to path, distance, duration, maneuvers.
 */

import type { ValhallaRouteResult, RouteManeuver } from './types.js';

export interface RawRoutePayload {
  path?: Array<[number, number]> | Array<{ lon: number; lat: number }>;
  distance?: number;
  duration?: number;
  maneuvers?: Array<{
    type?: string;
    instruction?: string;
    distance?: number;
    duration?: number;
    location?: { lat: number; lon: number };
  }>;
  trip?: {
    locations?: Array<{ lon?: number; lat?: number }>;
    summary?: { length?: number; time?: number };
    legs?: Array<{
      shape?: string;
      summary?: { length?: number; time?: number };
      maneuvers?: Array<{
        type?: number | string;
        instruction?: string;
        length?: number;
        time?: number;
        begin_shape_index?: number;
        end_shape_index?: number;
        location?: { lat?: number; lon?: number };
      }>;
    }>;
  };
}

function toPath(raw: RawRoutePayload): [number, number][] {
  if (raw.path && Array.isArray(raw.path)) {
    return raw.path.map((p) => (Array.isArray(p) ? (p as [number, number]) : [p.lon, p.lat]));
  }
  if (raw.trip?.legs) {
    const coords: [number, number][] = [];
    for (const leg of raw.trip.legs) {
      if (leg.shape) {
        try {
          const decoded = decodePolyline(leg.shape);
          coords.push(...decoded);
        } catch {
          // skip
        }
      }
    }
    if (coords.length > 0) return coords;
  }
  return [];
}

function decodePolyline(encoded: string): [number, number][] {
  const out: [number, number][] = [];
  let i = 0;
  let lat = 0;
  let lon = 0;
  while (i < encoded.length) {
    let shift = 0;
    let b: number;
    let result = 0;
    do {
      b = encoded.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1 ? ~(result >> 1) : result >> 1) / 1e5;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlon = (result & 1 ? ~(result >> 1) : result >> 1) / 1e5;
    lat += dlat;
    lon += dlon;
    out.push([lon, lat]);
  }
  return out;
}

function toDistance(raw: RawRoutePayload): number {
  if (typeof raw.distance === 'number' && raw.distance >= 0) return raw.distance;
  if (raw.trip?.summary?.length != null) return raw.trip.summary.length * 1000;
  if (raw.trip?.legs) {
    let m = 0;
    for (const leg of raw.trip.legs) {
      if (leg.summary?.length != null) m += leg.summary.length * 1000;
    }
    if (m > 0) return m;
  }
  return 0;
}

function toDuration(raw: RawRoutePayload): number | undefined {
  if (typeof raw.duration === 'number' && raw.duration >= 0) return raw.duration;
  if (raw.trip?.summary?.time != null) return raw.trip.summary.time;
  if (raw.trip?.legs) {
    let s = 0;
    for (const leg of raw.trip.legs) {
      if (leg.summary?.time != null) s += leg.summary.time;
    }
    if (s > 0) return s;
  }
  return undefined;
}

function toManeuvers(raw: RawRoutePayload): RouteManeuver[] | undefined {
  if (raw.maneuvers && Array.isArray(raw.maneuvers)) {
    return raw.maneuvers.map((m) => ({
      type: String(m.type ?? ''),
      instruction: m.instruction,
      distance: m.distance,
      duration: m.duration,
      location: m.location,
    }));
  }
  if (raw.trip?.legs) {
    const list: RouteManeuver[] = [];
    for (const leg of raw.trip.legs) {
      if (leg.maneuvers) {
        for (const m of leg.maneuvers) {
          list.push({
            type: String(m.type ?? ''),
            instruction: m.instruction,
            distance: m.length != null ? m.length * 1000 : undefined,
            duration: m.time,
            location: m.location
              ? { lat: m.location.lat ?? 0, lon: m.location.lon ?? 0 }
              : undefined,
          });
        }
      }
    }
    if (list.length > 0) return list;
  }
  return undefined;
}

/**
 * Parse native route JSON string and return canonical ValhallaRouteResult, or null if invalid.
 */
export function normalizeRouteResult(json: string): ValhallaRouteResult | null {
  if (!json || typeof json !== 'string') return null;
  try {
    const raw = JSON.parse(json) as RawRoutePayload;
    const path = toPath(raw);
    const distance = toDistance(raw);
    if (path.length === 0 && distance === 0) return null;
    const duration = toDuration(raw);
    const maneuvers = toManeuvers(raw);
    return { path, distance, duration, maneuvers };
  } catch {
    return null;
  }
}
