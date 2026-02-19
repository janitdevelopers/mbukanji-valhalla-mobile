/**
 * Canonical types for mbukanji-valhalla-mobile.
 * Aligned with Web WASM route shape and shared pack semantics.
 */

/** Canonical route result (parity with Web ValhallaRouteResult). */
export interface ValhallaRouteResult {
  path: [number, number][];
  distance: number;
  duration?: number;
  maneuvers?: RouteManeuver[];
}

export interface RouteManeuver {
  type: string;
  instruction?: string;
  distance?: number;
  duration?: number;
  location?: { lat: number; lon: number };
}

/** Request for a route (same semantics as WASM). */
export interface RouteRequest {
  locations: Array<{ lat: number; lon: number }>;
  costing?: string;
  directions_type?: 'none' | 'maneuvers';
}

/** Canonical error codes (shared with Web for parity). */
export type ValhallaMobileErrorCode =
  | 'ENGINE_INIT_FAILED'
  | 'PACK_CORRUPT'
  | 'PACK_INCOMPATIBLE'
  | 'ROUTE_NOT_FOUND'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'INVALID_REQUEST'
  | 'UNKNOWN';

export interface ValhallaMobileError {
  code: ValhallaMobileErrorCode;
  message: string;
  requestId?: string;
}
