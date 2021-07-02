import type { NextApiRequest, NextApiResponse } from 'next'
import admin, { privateKey } from '../../../shared/firebase-admin'
import { sign } from 'jsonwebtoken'

export type JWTData = {
  exp: number
  ip: string | string[]
  session: string | string[]
  uid: string
}

export type APIResult = {
  success: boolean
  message: string
}

/**
 * Gets the encoded ID token used for Electron Applications
 */
export default async (req: NextApiRequest, res: NextApiResponse<APIResult>): Promise<void> => {
  let ip = req.headers['x-real-ip'] || req.socket.remoteAddress
  if (ip && ip.toString().substr(0, 7) == '::ffff:') {
    ip = ip.toString().substr(7)
    console.log(ip)
  }
  const token = req.query.token
  const session = req.query.session
  if (!token || !session || req.method != 'GET') {
    return res.status(400).json({ success: false, message: 'request-not-allowed' })
  }
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(token.toString())
    if (new Date().getTime() / 1000 - decodedIdToken.auth_time > 2 * 60) {
      return res.status(400).json({ success: false, message: 'request-expired' })
    }
    // Generate a token ID for Electron Clients
    const data: JWTData = {
      exp: Math.floor(Date.now() / 1000) + 2 * 60,
      ip,
      session,
      uid: decodedIdToken.uid,
    }
    const message = sign(data, privateKey, { algorithm: 'RS256' })
    return res.status(200).json({ success: true, message })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'server-error' })
  }
}