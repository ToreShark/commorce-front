import 'server-only'
import { SignJWT } from 'jose'
import { SessionPayload } from '@/lib/types'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const payload: SessionPayload = { userId, expiresAt }
  const token = await encrypt(payload)
  return token
}

export async function getSessionFromLocalStorage() {
  const token = localStorage.getItem('token')
  console.log("URAAAAAAA TOKEN")
  return token
}