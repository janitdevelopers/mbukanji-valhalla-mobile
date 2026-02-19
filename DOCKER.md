# Docker — mbukanji-valhalla-mobile

This image provides a reproducible environment to **build** (TypeScript) and **run tests** (Vitest) for the package. It does not build Android/iOS native code or Valhalla C++; use the host or a dedicated NDK image for that.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running.

## Build the image

From the package root:

```bash
docker build -t mbukanji-valhalla-mobile .
```

Use a lockfile for reproducible installs (commit `pnpm-lock.yaml`); the Dockerfile uses `--frozen-lockfile` when available.

## Run tests (default)

```bash
docker run --rm mbukanji-valhalla-mobile
```

This runs `pnpm run test` (Vitest) inside the container.

## Shell

```bash
docker run -it --rm mbukanji-valhalla-mobile sh
```

Then you can run `pnpm run build`, `pnpm run test`, etc. manually.

## CI

In GitHub Actions or elsewhere, build and test in one go:

```yaml
- run: docker build -t mbukanji-valhalla-mobile .
- run: docker run --rm mbukanji-valhalla-mobile
```

## Optional: Valhalla Android build image

Building Valhalla C++ for Android (NDK + CMake) is not included in this image. To mirror the Valhalla WASM approach, you could add a separate Dockerfile (e.g. `docker/Dockerfile.android`) with the Android NDK and use it to produce the native library; see [VALHALLA_ANDROID_BUILD.md](https://github.com/janitdevelopers/JanPAMS/blob/main/docs/VALHALLA_ANDROID_BUILD.md) for host-based build steps.
