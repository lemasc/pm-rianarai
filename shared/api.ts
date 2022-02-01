import admin from './firebase-admin'
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'
import { withIronSession, Handler, Session } from 'next-iron-session'
import { Auth, google, Common } from 'googleapis'
import { APIResponse } from '@/types/classroom'
import { ClassroomCredentials } from '@/api/classroom/callback'

export type SSRContext = {
  req: GetServerSidePropsContext['req'] & { session: Session }
} & GetServerSidePropsContext

type SSRHandler = (context: SSRContext) => any

export type NextApiSessionRequest = NextApiRequest & {
  session: Session
  uid: string
  token: admin.auth.DecodedIdToken
}

export function withAuth(handler: Handler<NextApiSessionRequest, NextApiResponse>, cors?: boolean) {
  return async (req: NextApiSessionRequest, res: NextApiResponse<APIResponse>): Promise<void> => {
    if (cors) {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Accept')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      if (req.method === 'OPTIONS') {
        return res.status(200).end()
      }
    }
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ success: false })
    }
    const auth = admin.auth()
    const token = authHeader.split(' ')[1]
    try {
      const decodedToken = await auth.verifyIdToken(token)
      if (!decodedToken || !decodedToken.uid) return res.status(401).json({ success: false })
      req.uid = decodedToken.uid
      req.token = decodedToken
    } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false })
    }
    return handler(req, res)
  }
}
export const sessionOptions = {
  password: process.env.SESSION_PASSWORD,
  cookieName: 'rianarai',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export function withSession(handler: Handler<NextApiRequest, NextApiResponse> | SSRHandler) {
  return withIronSession(handler, sessionOptions)
}

export function createOAuth2(req: NextApiRequest): Auth.OAuth2Client {
  const proto = req.headers.host.includes('localhost') ? 'http' : 'https'
  const callbackUrl =
    proto + '://' + req.headers.host + req.url.split('?')[0].slice(0, req.url.lastIndexOf('/'))
  return new google.auth.OAuth2(
    process.env.CLASSROOM_CLIENT_ID,
    process.env.CLASSROOM_CLIENT_SECRET,
    callbackUrl.includes('callback') ? callbackUrl : callbackUrl + '/callback'
  )
}

type APIRequestFunction<T> = (oAuth2Client: Auth.OAuth2Client) => Promise<Common.GaxiosResponse<T>>
type APIRequestResult<T> = {
  result: Common.GaxiosResponse<T>
  oAuth2Client: Auth.OAuth2Client
}
/**
 * Helper function that will automatically check and update the refresh token.
 *
 * @param oAuth2Client OAuth2Client instance
 * @param req NextJS Session Request
 * @param request Google API Request Function
 * @param update (Optional) Updates the global token database using the given account ID.
 * @returns Object containing the oAuth instance and the API result.
 */
export async function withRefreshToken<T = any>(
  oAuth2Client: Auth.OAuth2Client,
  req: NextApiSessionRequest,
  request: APIRequestFunction<T>,
  update?: string
): Promise<APIRequestResult<T>> {
  const currentToken: Auth.Credentials = Object.assign({}, oAuth2Client.credentials)
  const result = await request(oAuth2Client)
  if (
    currentToken.access_token &&
    currentToken.access_token !== oAuth2Client.credentials.access_token &&
    update
  ) {
    console.log('Update token')
    const newCredentials = {
      access_token: oAuth2Client.credentials.access_token,
      refresh_token: oAuth2Client.credentials.refresh_token,
      expiry_date: new Date(oAuth2Client.credentials.expiry_date),
    }
    try {
      await admin
        .firestore()
        .collection('users')
        .doc(req.session.get('uid'))
        .collection('classroom')
        .doc(update)
        .update(newCredentials)
      const tokens: ClassroomCredentials[] = Object.assign([], req.session.get('token'))
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].id === update) {
          tokens[i] = { ...newCredentials, ...tokens[i] }
        }
      }
      req.session.set('token', tokens)
    } catch (err) {
      console.error(err)
    }
  }
  return { result, oAuth2Client }
}
