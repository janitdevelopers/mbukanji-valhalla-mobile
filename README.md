# mbukanji-valhalla-mobile

Valhalla **native** routing for React Native (Android and iOS). Offline-first; same pack pipeline and canonical route shape as Web WASM (`mbukanji-valhalla-wasm`).

## Status

- **Phase 0:** Foundations — complete.
- **Phase 1:** Android vertical slice — complete (stub engine; link Valhalla lib for real routing). See [VALHALLA_ANDROID_BUILD.md](../../docs/VALHALLA_ANDROID_BUILD.md).
- **Phase 2:** Pack hardening + parity CI.
- **Phase 3:** iOS native integration.
- **Phase 4:** Stabilization and rollout.

## API (v1)

- `createValhallaMobileRouter()` — returns a router instance (backed by native module when linked).
- `init()` — initialize the native engine (off UI thread).
- `loadPack(packPath, options?)` — load tiles from a pack path; atomic swap.
- `routeWithManeuvers(requestId, request)` — compute route; supports cancellation via `requestId`.
- `cancel(requestId)` — cancel an in-flight request.

Types: `ValhallaRouteResult`, `RouteRequest`, `ValhallaMobileError`, `ValhallaMobileErrorCode`.

## Package layout

- `src/` — TypeScript API, types, normalizer (and later error mapper).
- `toolchain.lock.json` — Pinned Android toolchain (NDK, CMake, Valhalla version). See [TOOLCHAIN_LOCK.md](../../docs/TOOLCHAIN_LOCK.md).
- `parity-tolerance.json` — Tolerances for Web vs Mobile route parity tests. See [PARITY_TOLERANCE.md](../../docs/PARITY_TOLERANCE.md).
- `android/` — Android native module (Valhalla C++, JNI, EngineManager). *To be added in Phase 1.*
- `ios/` — iOS native module (XCFramework, ObjC++ bridge). *To be added in Phase 3.*

## Tasks

See [VALHALLA_MOBILE_TASKS.md](../../docs/VALHALLA_MOBILE_TASKS.md) in the repo docs.

## References

- [Valhalla Native Mobile Full Implementation Plan](https://) (JanPAMS).
- [VALHALLA_ROUTING_IMPLEMENTATION.md](../../docs/VALHALLA_ROUTING_IMPLEMENTATION.md) — Web WASM (parity reference).
