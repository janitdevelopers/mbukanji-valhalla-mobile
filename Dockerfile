# mbukanji-valhalla-mobile — build and test image
# Runs pnpm install, build (tsc), and tests (vitest) in a reproducible environment.
#
# Usage:
#   docker build -t mbukanji-valhalla-mobile .
#   docker run --rm mbukanji-valhalla-mobile
#
# Shell:
#   docker run -it --rm mbukanji-valhalla-mobile sh
#
# With lockfile (recommended for CI):
#   docker build -t mbukanji-valhalla-mobile . && docker run --rm mbukanji-valhalla-mobile

FROM node:20-bookworm-slim

LABEL maintainer="Mbukanji"
LABEL description="Build and test environment for @jansoft/mbukanji-valhalla-mobile"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

CMD ["pnpm", "run", "test"]
