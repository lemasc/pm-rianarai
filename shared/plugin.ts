import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PLUGIN_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_PLUGIN_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PLUGIN_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_PLUGIN_APP_ID,
}
const app =
  getApps()?.length == 2 ? getApp('wpm-plugin') : initializeApp(firebaseConfig, 'wpm-plugin')
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db, app }
