import { describe, it, expect } from 'vitest';
import { validateManifest, PACK_SCHEMA_VERSION, SUPPORTED_ENGINE_COMPAT } from './packSchema.js';

describe('validateManifest', () => {
  const validManifest = {
    schemaVersion: 1,
    packId: 'CM-SW',
    packVersion: '2025.02.1',
    valhallaTileVersion: '3.2',
    profiles: ['auto', 'bicycle', 'pedestrian'],
    engineCompat: 'valhalla-3.2',
    checksums: { valhalla_tiles: 'sha256:abc' },
    valhalla_tile_count: 42,
  };

  it('accepts valid manifest', () => {
    const r = validateManifest(validManifest);
    expect(r.valid).toBe(true);
    expect(r.manifest).toBeDefined();
    expect(r.manifest?.packId).toBe('CM-SW');
    expect(r.errors).toHaveLength(0);
  });

  it('rejects wrong schemaVersion', () => {
    const r = validateManifest({ ...validManifest, schemaVersion: 2 });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('schemaVersion'))).toBe(true);
  });

  it('rejects missing packId', () => {
    const { packId, ...rest } = validManifest;
    const r = validateManifest(rest);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('packId'))).toBe(true);
  });

  it('rejects valhalla_tile_count 0', () => {
    const r = validateManifest({ ...validManifest, valhalla_tile_count: 0 });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('valhalla_tile_count'))).toBe(true);
  });

  it('rejects unsupported engineCompat', () => {
    const r = validateManifest({ ...validManifest, engineCompat: 'valhalla-2.0' });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('engineCompat'))).toBe(true);
  });

  it('exports schema version and supported compat', () => {
    expect(PACK_SCHEMA_VERSION).toBe(1);
    expect(SUPPORTED_ENGINE_COMPAT).toContain('valhalla-3.2');
  });
});
