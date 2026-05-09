# CUU (Club Union University) · 경인권 연합동아리 운영 플랫폼 (Frontend)

자연어 한 줄 → 3-step 위저드 → 장소·공지 초안 → 승인·모집. 회장이 행사를 만들고, 부원이 모이고, 학교 단위로 정보가 흐르는 플랫폼의 **웹 프론트엔드**입니다.

npm 패키지명: **`aingthon`**.

## 스택

| 영역            | 선택                                              | 비고                                                       |
| --------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| 빌드            | Vite 6                                            | SPA                                                        |
| 언어            | TypeScript 5.7 + React 19                         | strict                                                     |
| 라우팅          | TanStack Router (파일 기반 + 코드 스플릿)         | `src/app/routes/`, `routeTree.gen.ts` 자동 생성            |
| 서버 상태       | TanStack Query v5                                 | 도메인별 `eventKeys` 등 query key factory                  |
| 클라이언트 상태 | Zustand v5 + persist                              | `features/auth` 등                                         |
| 폼              | react-hook-form + zod                             |                                                            |
| 스타일          | Tailwind CSS 3 + CSS 변수(`globals.css`) + shadcn식 | `tailwind.config.ts`에서 토큰 확장                         |
| HTTP            | axios + `BaseApi`                                 | `src/shared/api/base.ts`                                   |
| API 타입        | openapi-typescript                                | OpenAPI YAML → `src/shared/api/schema.gen.ts` (수동 수정 금지) |
| 로컬 API 목업   | MSW v2                                            | `VITE_USE_MOCKS` 로 켜고 끔                               |

## 시작

```bash
pnpm install
cp .env.example .env
pnpm dev
```

개발 서버: **http://localhost:5173**

`vite.config.ts`의 dev proxy가 **`/api` → `http://localhost:8080`** 으로 넘깁니다. MSW를 켠 상태(`VITE_USE_MOCKS=true`)에서는 브라우저에서 `/api` 요청이 목 워커로 처리되고, Spring 등 실서버만 쓸 때는 `.env`에서 목을 끕니다.

## 환경 변수

`.env.example`을 복사해 사용합니다. 주요 항목:

| 변수                     | 설명                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `VITE_USE_MOCKS`         | `true`(기본): MSW로 `/api` 모킹. 실백엔드만 쓸 때 **`false`** 로 끔 |
| `VITE_API_BASE_URL`      | axios baseURL. 보통 `/api`. 원격 백엔드면 절대 URL + `/api` 까지    |
| `VITE_FIREBASE_*`        | Firebase Auth (미설정 시 mock 로그인 흐름)                           |
| `VITE_ENABLE_ROLE_SWITCH`| 프로필에서 역할 전환(개발용). 운영에서는 끄는 것을 권장              |

## MSW (Mock Service Worker)

- 엔트리: `src/main.tsx` — `VITE_USE_MOCKS !== 'false'` 이면 `src/mocks/browser.ts` 워커 기동.
- 핸들러: `src/mocks/handlers/` — 행사 AI Step1/Step2, PATCH 후 `step1Data` 등 인메모리 DB와 맞춰 둠.
- 프로덕션(Vercel 등)에서 실 API를 쓰려면 **`VITE_USE_MOCKS=false`** 와 올바른 **`VITE_API_BASE_URL`** 을 설정합니다.

## 행사 AI 위저드 (요약)

- 경로: 로그인 후 **`/events/:eventId/wizard`** (Step 1 기본 정보 → Step 2 게시판/장소 → Step 3 승인).
- Step 1 `POST /events/:id/ai/step1` 성공 시 서버(또는 MSW)가 `step1Data`를 갱신합니다. 프론트는 **`useEventAiStep1` 성공 후 상세 쿼리 캐시를 병합·무효화**해 Step 2에서 `event.step1Data`를 쓸 수 있게 맞춰 두었습니다.
- Step 2는 `step1Result`(서버 계약상 `event.step1Data`)와 학교·시설 페이로드를 `POST /events/:id/ai/step2`에 넘깁니다.

## 디렉토리 (FSD-lite)

```
src/
  app/
    providers.tsx          QueryClient, Router, 기타 프로바이더
    routes/                TanStack Router 파일 기반 라우트
      __root.tsx
      index.tsx             랜딩
      login.tsx, signup.tsx
      _authed/
        route.tsx           인증 레이아웃·가드
        clubs/, events/, schools/, profile, admin/ …
  shared/
    api/                    BaseApi, client, schema.gen.ts, types
    config/env.ts           import.meta.env 정규화
    ui/                     공통 UI 프리미티브
  features/                 도메인별 api.ts · queries.ts · index.ts
  mocks/                    MSW 브라우저·핸들러·시드 DB
  styles/globals.css        디자인 토큰(HSL CSS 변수)
  routeTree.gen.ts          라우트 플러그인 자동 생성 (직접 수정 지양)
```

### BaseApi 패턴

도메인 API는 `BaseApi`를 상속해 `get/post/patch/delete`를 쓰고, 컴포넌트는 `apiClient`가 아니라 **`eventApi`, `clubApi`** 같은 도메인 인스턴스만 호출합니다.

### 훅 위치

페이지 전용 데이터 훅은 **`features/<domain>/queries.ts`** 에 두고, 라우트 파일에서는 조합만 합니다.

## 디자인 토큰

`src/styles/globals.css`의 `:root` / `.dark`에 **HSL CSS 변수**로 surface·brand·타이포를 정의하고, `tailwind.config.ts`의 `extend.colors`로 매핑합니다. 브랜드 프라이머리는 Indigo `#4F46E5` 계열입니다.

## 스크립트

```bash
pnpm dev            # Vite 개발 서버 (5173)
pnpm build          # tsc -b && vite build
pnpm preview        # 빌드 미리보기
pnpm typecheck      # tsc -b --noEmit
pnpm lint           # ESLint
pnpm format         # Prettier (src ts/tsx/css)
pnpm openapi:gen    # OpenAPI YAML → schema.gen.ts (package.json의 입력 경로 확인)
pnpm bones:gen      # Skeleton bones 캡처 (dev 서버 필요)
pnpm bones:watch    # bones 자동 재캡처
```

## OpenAPI 동기화

`package.json`의 `openapi:gen` 스크립트는 OpenAPI YAML 경로를 가리킵니다. 스펙 파일 위치에 맞게 경로를 바꾼 뒤:

```bash
pnpm openapi:gen
```

`src/shared/api/schema.gen.ts`는 생성물이므로 직접 수정하지 않고, 필요 시 `src/shared/api/types.ts`에서 alias만 조정합니다.

## Skeleton 로딩 (Boneyard)

로딩 구간은 `<Skeleton name="..." loading={isLoading}>...</Skeleton>` 으로 감쌉니다. CLI가 실제 DOM 레이아웃을 캡처해 `src/bones/*.bones.json`과 `registry.ts`를 갱신합니다.

1. `pnpm dev`
2. 다른 터미널에서 `pnpm bones:gen` (또는 `pnpm bones:watch`)

### `boneAuth` (개발·캡처용)

`?boneAuth=super_admin|president|member` 가 있고 **MSW가 켜진 환경**에서만 mock 인증을 주입합니다(`src/main.tsx`). 실백엔드만 쓸 때(`VITE_USE_MOCKS=false`)는 동작하지 않습니다.

## 로드맵 / 여유 과제

- 학교 인증·화이트리스트 가드 강화
- Firebase Auth 운영 연동·mock 로그인 정리
- 행사 게시판 실시간(STOMP/SSE 등) 다듬기
- E2E·스토리북(선택)

---

문의·백엔드 저장소 정책은 팀 내 컨벤션을 따릅니다.
