/**
 * 제너레이터(`routeTree.gen.ts`)가 `declare module '@tanstack/react-router'` 에만
 * `FileRoutesByPath` 를 채우지만, `createFileRoute()` 제네릭은 `@tanstack/router-core` 의
 * `FileRoutesByPath`를 씁니다. IDE에서 2345가 날 때 core 쪽 인터페이스를 동일 타입으로 이어 줌.
 *
 * `main.tsx`에서 side-effect 로 import 되어 프로그램 루트에 항상 포함됩니다.
 */
/// <reference path="./routeTree.gen.ts" />

import type { FileRoutesByPath as ReactRouterFileRoutesByPath } from '@tanstack/react-router'

declare module '@tanstack/router-core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface FileRoutesByPath extends ReactRouterFileRoutesByPath {}
}

export {}
