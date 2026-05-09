# CUU (Club Union University) · 경인권 연합동아리 운영 플랫폼 (Frontend)

자연어 한 줄 → 3-step 위저드 → 다중 노출 자동 발행. 회장이 행사를 만들고, 부원이 자동으로 모이고, 학교 게시판으로 정보가 흐르는 플랫폼.

## 스택

| 영역             | 선택                                        | 비고                                                    |
| ---------------- | ------------------------------------------- | ------------------------------------------------------- |
| 빌드             | Vite 6                                      | SPA. Spring 단일 진입점 아키텍처에 부합                 |
| 언어             | TypeScript 5.7 + React 19                   | strict + verbatimModuleSyntax                           |
| 라우팅           | TanStack Router (file-based + auto split)   | `src/app/routes/`                                       |
| 서버 상태        | TanStack Query v5                           | 도메인별 query key factory                              |
| 클라이언트 상태  | Zustand v5 + persist                        | `useAuthStore` 등 feature 안에 위치                     |
| 스타일링         | Tailwind v4 (`@theme` CSS-first) + shadcn식 | Primitive → Semantic 2단 토큰                           |
| HTTP             | axios + 자체 BaseApi 추상                   | 도메인 API는 `BaseApi` 상속 후 prefix 주입              |
| API 스키마       | openapi-typescript                          | `crew-openapi.yaml` → `src/shared/api/schema.gen.ts`    |

## 시작

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`vite.config.ts`의 dev proxy(`/api → localhost:8080`)가 Spring 백엔드로 프록시한다.

## 디렉토리 (FSD-lite)

```
src/
  app/                     앱 셸 (providers, query-client, routes/)
    routes/                TanStack Router 파일 기반 라우트
      __root.tsx           루트 레이아웃 + Devtools
      index.tsx            랜딩
  shared/                  도메인 비의존 재사용 모듈
    api/
      base.ts              BaseApi (모든 도메인 API의 부모) + createApiClient
      client.ts            전역 axios 인스턴스 (auth store 의존성 주입)
      error.ts             ApiError 정규화
      query-keys.ts        STALE_TIMES 등 공통 헬퍼
      schema.gen.ts        OpenAPI 자동 생성 (수정 금지)
      types.ts             schema.gen → 도메인 친화적 alias
      index.ts             퍼블릭 API
    config/env.ts          import.meta.env 정규화
    lib/cn.ts              clsx + tailwind-merge
    ui/                    shadcn 스타일 primitive (button, input, card, badge)
  features/                도메인별 비즈니스 로직
    <domain>/
      api.ts               BaseApi 상속 클래스 + 외부 export 인스턴스
      queries.ts           TanStack Query 훅 + queryKey factory
      store.ts             Zustand (필요시)
      index.ts             퍼블릭 API
  styles/globals.css       Tailwind import + design tokens
  routeTree.gen.ts         자동 생성 (gitignored)
```

### 왜 BaseApi 상속인가

- 모든 도메인 API는 `BaseApi`를 상속해 `get/post/patch/delete`를 protected로 사용한다.
- 인증 헤더, 401 핸들링, 에러 정규화가 한 곳에 모인다.
- 도메인 스펙이 늘어도 BaseApi에 cross-cutting 로직 한 줄 추가하면 모든 API가 혜택을 본다.
- 컴포넌트는 `apiClient`를 직접 쓰지 않고 항상 도메인 API 인스턴스(`authApi`, `clubApi`, ...)를 호출한다.

```ts
// 새 도메인 추가 패턴
class PostApi extends BaseApi {
  list(q) { return this.get<Post[]>('', { params: q }) }
  detail(id) { return this.get<Post>(`/${id}`) }
}
export const postApi = new PostApi(apiClient, '/posts')
```

### 훅 분리 원칙

각 페이지가 자기 훅을 모두 갖지 않는다. 훅은 도메인(`features/<domain>/queries.ts`)에 모이고, 페이지는 조합만 한다.

```ts
// src/app/routes/clubs.tsx
import { useClubs } from '@/features/club'
const { data } = useClubs({ status: 'APPROVED' })
```

## 디자인 토큰 (seed-design 영감)

`src/styles/globals.css`에 두 단계로 분리:

1. **Primitive** (`@theme`): `--color-indigo-600`, `--color-gray-100` 등 — 색 자체.
2. **Semantic** (`@theme inline`): `--color-brand`, `--color-bg-canvas`, `--color-fg-default` 등 — 의미.

컴포넌트는 항상 Semantic만 참조한다. 다크모드는 `.dark` 클래스에서 Semantic만 재정의하면 끝.

브랜드 색은 Indigo `#4F46E5` (Linear/Vercel 톤). 정보 밀도 높은 UI에 잘 맞고 `#EEF2FF` ~ `#312E81`까지 명도 폭이 넓어 위계 구성이 쉽다.

## 스크립트

```bash
pnpm dev            # 개발 서버 (5173)
pnpm build          # tsc 빌드 + vite 빌드
pnpm preview        # 빌드 결과 미리보기
pnpm typecheck      # tsc -b --noEmit
pnpm openapi:gen    # crew-openapi.yaml → schema.gen.ts 재생성
pnpm bones:gen      # 실제 DOM에서 skeleton bones 캡처 (dev 서버 필요)
pnpm bones:watch    # HMR과 함께 bones 자동 재캡처
```

## OpenAPI 동기화

스펙이 바뀌면:

```bash
pnpm openapi:gen
```

`schema.gen.ts`는 자동 생성이므로 직접 수정 금지. 필요하면 `src/shared/api/types.ts`에 alias만 추가/조정.

## Skeleton 로딩 (Boneyard)

로딩 자리는 `<Skeleton name="..." loading={isLoading}>...</Skeleton>` 으로 감싼다. 실제 렌더된 DOM을 캡처해 정확히 일치하는 회색 블록(bones)을 표시 — 텍스트 "불러오는 중…" 보다 시각적 안정감이 좋고 layout shift 없음.

### 생성 방법

1. dev 서버 실행: `pnpm dev`
2. 다른 터미널에서: `pnpm bones:gen`
   - 헤드리스 브라우저가 `?boneAuth=super_admin` 으로 자동 로그인 → 모든 라우트에서 `<Skeleton>` 발견 → 데이터 로드된 DOM의 위치/크기 캡처 → `src/bones/*.bones.json` 생성
   - 함께 `src/bones/registry.ts` 도 자동 갱신
3. `main.tsx` 에서 이미 `import './bones/registry'` 함 → bones 자동 로드

### auto-auth 메커니즘

- `_authed` 가드는 비로그인 시 `/login` 으로 리다이렉트하므로 캡처 불가
- `main.tsx` 에서 `?boneAuth=role` URL 파라미터 감지 시 즉시 mock 인증 주입 (dev 모드 한정)
- `super_admin` 으로 캡처하면 admin / president / member 화면 모두 통과

### 빈 bones 상태

CLI를 실행하기 전이거나 등록 안된 `name` 일 때 Skeleton은 자체 fallback (회색 블록) 표시. `src/bones/registry.ts` 는 빈 stub 으로 시작 (CLI가 덮어씀).

## 다음 작업 (P0 후보)

- 학교 인증 + 경인권 화이트리스트 가드
- 회장 동아리 등록 + Super Admin 승인 대시보드
- 부원 초대 코드 가입 + 역할 선언 폼
- 위저드 진입 시 행사 타입 선택 (교내/연합)
- Step 1/2 자연어 정제 화면 (Spring → Nest → Gemini)
- Step 3 승인 + 다중 노출 발행 트리거
- 행사 게시판 + 채팅 (STOMP 또는 SSE)
