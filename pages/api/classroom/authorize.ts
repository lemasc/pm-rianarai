import type { NextApiResponse } from 'next'
import { withSession, NextApiSessionRequest, createOAuth2 } from '@/shared/api'
import { nanoid } from 'nanoid'
import { APIResponse } from '@/types/classroom'
/**
 * Redirect to Google's OAuth Consent Screen with Classroom API Scopes.
 * This service is dependent from the Firebase Authentication,
 * means that users can connect one or more accounts, providing more flexible system.
 */

const OAuth = async (
  req: NextApiSessionRequest,
  res: NextApiResponse<APIResponse>
): Promise<void> => {
  if (req.method !== 'GET') return res.status(400).json({ success: false })
  try {
    const oauth2Client = createOAuth2(req)
    const scopes: string[] = [
      'courses.readonly',
      'coursework.me',
      'announcements.readonly',
      'courseworkmaterials.readonly',
      'student-submissions.me.readonly',
      'topics.readonly',
    ]
    const state = nanoid()
    const redirectUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'profile',
        'email',
        ...scopes.map((s) => 'https://www.googleapis.com/auth/classroom.' + s),
      ],
      state,
    })
    req.session.unset('nonce')
    req.session.set('nonce', state)
    await req.session.save()
    res.redirect(redirectUrl)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false })
  }
}
export default withSession(OAuth)
