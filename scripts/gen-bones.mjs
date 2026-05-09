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
const AUTH = 'boneAuth=super_admin'

/**
 * 캡처할 라우트 목록.
 * 각 항목은 dev 서버에서 mock 데이터로 정상 렌더되는 URL이어야 함.
 * mock DB 시드 기준으로 club id 1, event id 1, school id 1 모두 존재.
 */
const ROUTES = [
  '/clubs',
  '/clubs/1',
  '/clubs/1/board',
  '/events',
  '/events/1',
  '/events/1/board',
  '/schools',
  '/schools/1/board',
  '/admin/clubs',
]

let ok = 0
let fail = 0
for (const path of ROUTES) {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}${AUTH}`
  console.log(`\n→ ${path}`)
  const res = spawnSync('npx', ['boneyard-js', 'build', url], { stdio: 'inherit' })
  if (res.status === 0) ok++
  else fail++
}

console.log(`\n[gen-bones] OK ${ok} / FAIL ${fail}`)
process.exit(fail > 0 ? 1 : 0)
