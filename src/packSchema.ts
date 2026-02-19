/**
 * Pack schema v1 validation (PACK_SCHEMA_V1).
 * Validate manifest on load; reject or repair when required fields missing or invalid.
 */

export const PACK_SCHEMA_VERSION = 1;

export interface PackManifestV1 {
  schemaVersion: number;
  packId: string;
  packVersion: string;
  valhallaTileVersion: string;
  profiles: string[];
  engineCompat: string;
  checksums: Record<string, string>;
  valhalla_tile_count: number;
  createdAt?: string;
  bounds?: { west: number; south: number; east: number; north: number };
}

export interface PackValidationResult {
  valid: boolean;
  manifest?: PackManifestV1;
  errors: string[];
}

/** Supported engineCompat values the mobile engine accepts. */
export const SUPPORTED_ENGINE_COMPAT = ['valhalla-3.2', '3.2'] as const;

export function validateManifest(raw: unknown): PackValidationResult {
  const errors: string[] = [];
  if (raw == null || typeof raw !== 'object') {
    return { valid: false, errors: ['Manifest must be an object'] };
  }
  const m = raw as Record<string, unknown>;

  if (m.schemaVersion !== PACK_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${PACK_SCHEMA_VERSION}, got ${m.schemaVersion}`);
  }
  if (typeof m.packId !== 'string' || !m.packId.trim()) {
    errors.push('packId is required and must be a non-empty string');
  }
  if (typeof m.packVersion !== 'string' || !m.packVersion.trim()) {
    errors.push('packVersion is required and must be a non-empty string');
  }
  if (typeof m.valhallaTileVersion !== 'string' || !m.valhallaTileVersion.trim()) {
    errors.push('valhallaTileVersion is required and must be a non-empty string');
  }
  if (!Array.isArray(m.profiles) || m.profiles.length === 0) {
    errors.push('profiles is required and must be a non-empty array of strings');
  } else if (m.profiles.some((p: unknown) => typeof p !== 'string')) {
    errors.push('profiles must contain only strings');
  }
  if (typeof m.engineCompat !== 'string' || !m.engineCompat.trim()) {
    errors.push('engineCompat is required and must be a non-empty string');
  } else if (!SUPPORTED_ENGINE_COMPAT.includes(m.engineCompat as typeof SUPPORTED_ENGINE_COMPAT[number])) {
    errors.push(`engineCompat "${m.engineCompat}" is not supported; supported: ${SUPPORTED_ENGINE_COMPAT.join(', ')}`);
  }
  if (m.checksums == null || typeof m.checksums !== 'object' || Array.isArray(m.checksums)) {
    errors.push('checksums is required and must be an object');
  }
  const tileCount = m.valhalla_tile_count;
  if (typeof tileCount !== 'number' || !Number.isInteger(tileCount) || tileCount <= 0) {
    errors.push('valhalla_tile_count is required and must be an integer > 0');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const manifest: PackManifestV1 = {
    schemaVersion: m.schemaVersion as number,
    packId: String(m.packId).trim(),
    packVersion: String(m.packVersion).trim(),
    valhallaTileVersion: String(m.valhallaTileVersion).trim(),
    profiles: (m.profiles as string[]).map((p) => String(p)),
    engineCompat: String(m.engineCompat).trim(),
    checksums: { ...(m.checksums as Record<string, string>) },
    valhalla_tile_count: Number(m.valhalla_tile_count),
  };
  if (typeof m.createdAt === 'string') manifest.createdAt = m.createdAt;
  if (m.bounds && typeof m.bounds === 'object' && !Array.isArray(m.bounds)) {
    const b = m.bounds as Record<string, unknown>;
    if (typeof b.west === 'number' && typeof b.south === 'number' && typeof b.east === 'number' && typeof b.north === 'number') {
      manifest.bounds = { west: b.west, south: b.south, east: b.east, north: b.north };
    }
  }
  return { valid: true, manifest, errors: [] };
}
