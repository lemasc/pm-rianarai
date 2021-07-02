import { Auth } from 'googleapis'
import type { NextApiResponse } from 'next'
import admin from '@/shared/firebase-admin'
import { withSession, NextApiSessionRequest, createOAuth2, withRefreshToken } from '@/shared/api'
import { APIResponse } from '@/types/classroom'

export type ClassroomCredentials = {
  id: string
  access_token: string
  refresh_token: string
  expiry_date: Date
  name: string
  email: string
}

type UserInfo = {
  id: string
  email: string
  verfied_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

export async function getProfile(
  req: NextApiSessionRequest,
  oAuth2Client: Auth.OAuth2Client
): Promise<ClassroomCredentials> {
  const api = await withRefreshToken(oAuth2Client, req, async (oAuth2Client) => {
    return await oAuth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    })
  })
  const info = api.result.data as UserInfo
  const tokens = api.oAuth2Client.credentials
  const db = admin.firestore()
  console.log('Fetch complete')
  const credentials: ClassroomCredentials = {
    id: info.id,
    name: info.name,
    email: info.email,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: new Date(tokens.expiry_date),
  }
  await db
    .collection('users')
    .doc(req.session.get('uid'))
    .collection('classroom')
    .doc(info.id)
    .set(credentials)
  console.log('Updated')
  return credentials
}

/**
 * OAuth2 Callback Page
 * Attemps to save the token result into Firebase.
 * Fetching email address to distinguish accounts connected to the service.
 */

const OAuth2Callback = async (
  req: NextApiSessionRequest,
  res: NextApiResponse<APIResponse>
): Promise<void> => {
  if (!req.query.code || !req.query.state || req.query.state !== req.session.get('nonce')) {
    res.redirect('/work?error=' + req.query.error)
    return
  }
  try {
    const oAuth2Client = createOAuth2(req)
    const { tokens } = await oAuth2Client.getToken(req.query.code as string)
    oAuth2Client.setCredentials(tokens)
    await getProfile(req, oAuth2Client)
    res.redirect('/work')
  } catch (err) {
    console.error(err)
    res.redirect('/work?error')
  }
}

export default withSession(OAuth2Callback)
