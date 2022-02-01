import * as admin from 'firebase-admin'

export const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
export const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
export const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID

let internalApp
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail,
      privateKey,
    }),
  })
  internalApp = admin.initializeApp(
    {
      projectId: process.env.FIREBASE_INTERNAL_PROJECT_ID,
    },
    'internal'
  )
}

export { internalApp }
export default admin
