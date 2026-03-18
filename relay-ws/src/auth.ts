import 'dotenv/config'

export interface AuthPayload {
  userId: string
}

/**
 * Temporary: accepts any token and extracts userId from the auth event.
 * Replace this with real JWT verification once NextAuth is set up.
 */
export function verifyToken(token: string, userId: string): AuthPayload | null {
  if (!token || !userId) return null
  // TODO: verify JWT signature using AUTH_SECRET
  return { userId }
}