/**
 * TypeScript resolution target for the NativeMap platform split.
 *
 * Metro picks NativeMap.native.tsx on iOS/Android and NativeMap.web.tsx on web.
 * This file exists solely so TypeScript (which doesn't understand Metro's
 * platform extension resolution) can resolve `@/components/NativeMap` and
 * type-check callsites against the shared interface.
 *
 * At runtime this module is never loaded — the platform-specific files take
 * precedence in every Metro configuration.
 */
export { default } from './NativeMap.web';
export type { NativeMapProps } from './NativeMap.web';
