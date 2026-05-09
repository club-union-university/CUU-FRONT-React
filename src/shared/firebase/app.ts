import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  type Auth,
} from 'firebase/auth'
import { env } from '@/shared/config/env'

export function isFirebaseConfigured(): boolean {
  return Boolean(
    env.FIREBASE.apiKey && env.FIREBASE.authDomain && env.FIREBASE.projectId,
  )
}

let app: FirebaseApp | undefined

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase client env vars are missing')
  }
  if (!app) {
    app = initializeApp({
      apiKey: env.FIREBASE.apiKey,
      authDomain: env.FIREBASE.authDomain,
      projectId: env.FIREBASE.projectId,
    })
  }
  return app
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp())
}

/** 로그인에 쓸 Firebase ID 토큰 (백엔드 verifyIdToken과 동일 문자열). */
export async function signInWithGoogleIdToken(): Promise<string> {
  const auth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()
  const { user } = await signInWithPopup(auth, provider)
  return user.getIdToken()
}
