/**
 * @jansoft/mbukanji-valhalla-mobile
 *
 * Valhalla native routing for React Native (Android / iOS).
 * Offline-first; same pack pipeline and route shape as Web WASM.
 *
 * API (v1): init(), loadPack(packPath), routeWithManeuvers(requestId, request), cancel(requestId).
 * Native module + JSON bridge; EngineManager lifecycle on native side.
 */

import type { RouteRequest, ValhallaRouteResult, ValhallaMobileErrorCode } from './types.js';
import { normalizeRouteResult } from './normalizeRouteResult.js';

export type {
  ValhallaRouteResult,
  RouteManeuver,
  RouteRequest,
  ValhallaMobileErrorCode,
  ValhallaMobileError,
} from './types.js';

export { normalizeRouteResult } from './normalizeRouteResult.js';
export { validateManifest, PACK_SCHEMA_VERSION, SUPPORTED_ENGINE_COMPAT } from './packSchema.js';
export type { PackManifestV1, PackValidationResult } from './packSchema.js';
export { compareWithinTolerance } from './parityCompare.js';
export type { Tolerance, ParityResult } from './parityCompare.js';

export interface ValhallaMobileRouter {
  init(): Promise<void>;
  loadPack(packPath: string, options?: { checksum?: string }): Promise<void>;
  routeWithManeuvers(requestId: string, request: RouteRequest): Promise<ValhallaRouteResult | null>;
  cancel(requestId: string): Promise<void>;
}

declare function require(module: string): unknown;

function getNativeModule(): { init: ()=>Promise<void>; loadPack: (path: string, opts: object)=>Promise<void>; routeJson: (id: string, json: string)=>Promise<{ result: string }>; cancel: (id: string)=>Promise<void> } | null {
  try {
    const { NativeModules } = require('react-native') as { NativeModules?: { ValhallaModule?: { init: () => Promise<void>; loadPack: (path: string, opts: object) => Promise<void>; routeJson: (id: string, json: string) => Promise<{ result: string }>; cancel: (id: string) => Promise<void> } } };
    const mod = NativeModules?.ValhallaModule;
    if (mod && typeof mod.init === 'function') return mod;
  } catch {
    // not in React Native or module not linked
  }
  return null;
}

function wrapRejection(e: unknown): never {
  const code = (e as { code?: string })?.code;
  const message = (e as { message?: string })?.message ?? String(e);
  const requestId = (e as { requestId?: string })?.requestId;
  const err = new Error(message) as Error & { code?: ValhallaMobileErrorCode; requestId?: string };
  err.code = (code as ValhallaMobileErrorCode) ?? 'UNKNOWN';
  err.requestId = requestId;
  throw err;
}

/** Create router: uses native module when linked, otherwise throws on use (stub). */
export function createValhallaMobileRouter(): ValhallaMobileRouter {
  const native = getNativeModule();

  if (native) {
    return {
      init: () => native.init().catch(wrapRejection),
      loadPack: (packPath, options) =>
        native.loadPack(packPath, options ?? {}).catch(wrapRejection),
      routeWithManeuvers: async (requestId, request) => {
        try {
          const requestJson = JSON.stringify(request);
          const res = await native.routeJson(requestId, requestJson);
          const resultJson = (res as { result?: string })?.result;
          if (resultJson == null || resultJson === '') return null;
          return normalizeRouteResult(resultJson) ?? null;
        } catch (e) {
          wrapRejection(e);
        }
      },
      cancel: (requestId) => native.cancel(requestId).catch(wrapRejection),
    };
  }

  return {
    init: async () => {
      throw new Error('Native module not linked. Implement Android JNI bridge (Phase 1).');
    },
    loadPack: async () => {
      throw new Error('Native module not linked. Implement Android JNI bridge (Phase 1).');
    },
    routeWithManeuvers: async () => {
      throw new Error('Native module not linked. Implement Android JNI bridge (Phase 1).');
    },
    cancel: async () => {
      throw new Error('Native module not linked. Implement Android JNI bridge (Phase 1).');
    },
  };
}
