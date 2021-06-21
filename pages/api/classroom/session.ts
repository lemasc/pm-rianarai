import admin from '../../../shared/firebase-admin'
import type { NextApiResponse } from 'next'
import {
  withSession,
  withAuth,
  APIResponse,
  NextApiSessionRequest,
  ClassroomSessionResult,
  createOAuth2,
} from '../../../shared/api'
import { ClassroomCredentials, getProfile } from './callback'

type ClassroomRefreshResult = {
  credentials?: ClassroomCredentials
  result: ClassroomSessionResult
}
async function refreshToken(
  req: NextApiSessionRequest,
  credentials: ClassroomCredentials
): Promise<ClassroomRefreshResult> {
  if (new Date() > (credentials.expiry_date as any).toDate()) {
    // Refresh token
    try {
      const oAuth2Client = createOAuth2(req)
      oAuth2Client.setCredentials({
        refresh_token: credentials.refresh_token,
      })
      credentials = await getProfile(req, oAuth2Client)
    } catch (err) {
      console.error(err)
      return {
        result: {
          valid: false,
          name: credentials.name,
          email: credentials.email,
        },
      }
    }
  }
  return {
    result: { valid: true, name: credentials.name, email: credentials.email },
    credentials,
  }
}

/**
 * Session Page
 *
 * Check for any existing Google Classroom token for the given user.
 * If no Google Classroom token was founded, the system will return false.
 *
 */

const sessionCheck = async (
  req: NextApiSessionRequest,
  res: NextApiResponse<APIResponse>
): Promise<void> => {
  // Try to check for any access tokens in the database
  const db = admin.firestore()
  req.session.set('uid', req.uid)
  const tokens = await db.collection('users').doc(req.uid).collection('classroom').get()
  if (tokens.docs.length == 0) {
    await req.session.save()
    return res.status(404).json({ success: false, data: 'class/not-registered' })
  }
  const data = tokens.docs.map((d) => d.data())
  const results = await Promise.all(
    data.map(async (d: ClassroomCredentials) => refreshToken(req, d))
  )
  req.session.set(
    'token',
    results.map((r) => r.credentials)
  )
  await req.session.save()
  return res.status(200).json({ success: true, data: results.map((r) => r.result) })
}

export default withSession(withAuth(sessionCheck))
