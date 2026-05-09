/**
 * Query Key 컨벤션 — 도메인별 factory 패턴.
 * 각 features/<domain>/queries.ts 에서 자기 도메인 키만 export 한다.
 * 여기서는 공통 헬퍼만 둔다.
 */
export type QueryKeyFactory<T extends string> = {
  [K in T]: readonly [K, ...unknown[]]
}

export const STALE_TIMES = {
  short: 30_000,
  medium: 5 * 60_000,
  long: 30 * 60_000,
  static: Infinity,
} as const
