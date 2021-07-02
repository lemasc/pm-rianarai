import type { NextApiRequest, NextApiResponse } from 'next'
import admin, { clientEmail, privateKeyId } from '../../../shared/firebase-admin'
import { Secret, verify, VerifyOptions } from 'jsonwebtoken'
import axios from 'axios'

export type JWTData = {
  exp: number
  ip: string | string[]
  session: string | string[]
  uid: string
}

export type APIResult = {
  success: boolean
  message: string | JWTData
}

/**
 * Parse the JWT tokens and returns the credentials to sign in to desktop clients
 */
export default async (req: NextApiRequest, res: NextApiResponse<APIResult>): Promise<void> => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, Content-Type, X-Requested-With, Authorization'
  )
  let ip = req.headers['x-real-ip'] || req.socket.remoteAddress
  if (ip && ip.toString().substr(0, 7) == '::ffff:') {
    ip = ip.toString().substr(7)
    console.log(ip)
  }
  const authHeader = req.headers.authorization
  const session = req.query.session
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  if (!authHeader || !session || req.method != 'POST') {
    return res.status(400).json({ success: false, message: 'request-not-allowed' })
  }

  const token = authHeader.split(' ')[1]

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function verifyPromise(token: string, secretOrPublicKey: Secret, options?: VerifyOptions) {
    return new Promise((resolve, reject) =>
      verify(token, secretOrPublicKey, options, (err, decoded) => {
        if (err) return reject(err)
        resolve(decoded)
      })
    )
  }
  try {
    const certList = await axios.get(
      'https://www.googleapis.com/robot/v1/metadata/x509/' + clientEmail
    )
    const certs = certList.data
    // Try to decode our JWT tokens
    try {
      const result = (await verifyPromise(token, certs[privateKeyId])) as JWTData
      // Token valid, verify the IP address and the session salt
      if (result.session !== session || result.ip !== ip) {
        return res.status(400).json({ success: false, message: 'invalid-token' })
      }
      // Verified required fields, let's generate the ACTUAL signInToken
      return res.status(200).json({
        success: true,
        message: await admin.auth().createCustomToken(result.uid, {
          electron: true,
        }),
      })
    } catch (err) {
      if (err.message === 'jwt expired')
        return res.status(400).json({ success: false, message: 'token-expired' })
      else console.log(err)
    }
    return res.status(400).json({ success: false, message: 'invalid-token' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'server-error' })
  }
}