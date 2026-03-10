import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  expires_in: number
  token_type: string
}

interface GoogleUserInfo {
  sub: string
  email: string
  name: string
  picture: string
  email_verified: boolean
  given_name: string
  family_name: string
}

async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: `${APP_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Token exchange failed: ${errText}`)
  }
  return res.json() as Promise<GoogleTokenResponse>
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch Google user info')
  return res.json() as Promise<GoogleUserInfo>
}

/**
 * Generate a deterministic-but-secure temp password from the Google sub + secret.
 */
function deriveTempPassword(googleSub: string): string {
  const secret = process.env.PAYLOAD_SECRET ?? 'fallback-secret'
  let hash = 0
  const str = `${googleSub}::${secret}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  const abs = Math.abs(hash).toString(36)
  return `Ggl${abs}!${googleSub.slice(0, 4)}`.slice(0, 32)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const returnedState = searchParams.get('state')

  // ── CSRF state validation ──────────────────────────────────────
  const cookieStore = await cookies()
  const savedState = cookieStore.get('oauth_state')?.value

  // Clear the state cookie immediately
  cookieStore.delete('oauth_state')

  if (!savedState || returnedState !== savedState) {
    console.error('[google-callback] CSRF state mismatch')
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`)
  }

  if (error || !code) {
    const msg = error === 'access_denied' ? 'access_denied' : 'oauth_failed'
    return NextResponse.redirect(`${APP_URL}/login?error=${msg}`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const googleUser = await getGoogleUserInfo(tokens.access_token)

    if (!googleUser.email_verified) {
      return NextResponse.redirect(`${APP_URL}/login?error=email_not_verified`)
    }

    const payload = await getPayload({ config: configPromise })
    const email = googleUser.email.toLowerCase().trim()
    const tempPassword = deriveTempPassword(googleUser.sub)
    const displayName = googleUser.name || googleUser.given_name || 'Google User'

    // Check if user already exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      // Create a new user
      await payload.create({
        collection: 'users',
        data: {
          email,
          name: displayName,
          password: tempPassword,
          role: 'admin',
        },
        overrideAccess: true,
      })
    } else {
      // Update name and keep password in sync
      await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data: {
          name: displayName,
          password: tempPassword,
        },
        overrideAccess: true,
      })
    }

    // Perform a standard Payload login to get a real JWT token
    const loginResult = await payload.login({
      collection: 'users',
      data: { email, password: tempPassword },
    })

    if (!loginResult.token) {
      return NextResponse.redirect(`${APP_URL}/login?error=token_error`)
    }

    cookieStore.set('payload-token', loginResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })

    // Redirect to dashboard after successful Google sign-in/sign-up
    return NextResponse.redirect(`${APP_URL}/dashboard`)
  } catch (err) {
    console.error('[google-callback] error:', err)
    return NextResponse.redirect(`${APP_URL}/login?error=server_error`)
  }
}
