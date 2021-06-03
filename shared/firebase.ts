import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/messaging'

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}
const app = firebase
const auth = firebase.auth()
const db = firebase.firestore()
const now = firebase.firestore.Timestamp.now()
const storage = firebase.storage()

export type UserData = firebase.User
// Fuego for Firebasev8

class Fuego {
  public db: ReturnType<firebase.app.App['firestore']>
  public auth: typeof firebase.auth
  public functions: typeof firebase.functions
  public storage: typeof firebase.storage
  constructor() {
    this.db = !firebase.apps.length
      ? firebase.initializeApp(firebaseConfig).firestore()
      : firebase.app().firestore()
    this.auth = firebase.auth
    this.functions = firebase.functions
    this.storage = firebase.storage
  }
}

export { auth, db, now, storage, Fuego, app }
