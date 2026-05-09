#!/usr/bin/env node
/**
 * Boneyard 일괄 캡처 스크립트.
 *
 * boneyard-js의 link crawler가 TanStack Router SPA 라우팅을 완전히 따라가지
 * 못하고, 헤드리스 브라우저가 라우트마다 localStorage를 reset 하기 때문에
 * 각 라우트 URL을 직접 명시해 boneyard-js build 를 반복 실행한다.
 *
 * 사용:
 *   pnpm dev          # 다른 터미널에서 dev 서버 실행
 *   pnpm bones:gen    # 이 스크립트 실행
 */
import { spawnSync } from 'node:child_process'

const BASE = process.env.BONEYARD_BASE ?? 'http://localhost:5173'

/**
 * 캡처할 라우트 목록 + 사용할 mock role.
 * mock DB 시드 기준으로 club id 1, event id 1, school id 1 모두 존재.
 *
 * 대부분 super_admin이면 충분하지만 일부 화면은 role-aware 분기가 있어
 * 그 화면이 마운트되는 시점의 role을 명시한다.
 *  - /events/1 의 ParticipantsSection 은 호스트 회장에게만 보이므로
 *    PRESIDENT(id=101, club 1 회장)로 캡처 → participants-list bones 확보
 */
const ROUTES = [
  ['/clubs', 'super_admin'],
  ['/clubs/1', 'super_admin'],
  ['/clubs/1/board', 'super_admin'],
  ['/events', 'super_admin'],
  ['/events/1', 'super_admin'],
  ['/events/1', 'president'], // 호스트 회장 시점 → participants-list 캡처
  ['/events/1/board', 'super_admin'],
  ['/schools', 'super_admin'],
  ['/schools/1/board', 'super_admin'],
  ['/admin/clubs', 'super_admin'],
]

let ok = 0
let fail = 0
for (const [path, role] of ROUTES) {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}boneAuth=${role}`
  console.log(`\n→ [${role}] ${path}`)
  const res = spawnSync('npx', ['boneyard-js', 'build', url], { stdio: 'inherit' })
  if (res.status === 0) ok++
  else fail++
}

console.log(`\n[gen-bones] OK ${ok} / FAIL ${fail}`)
process.exit(fail > 0 ? 1 : 0)
