import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from 'firebase/auth'
import { getDoc, setDoc, doc } from 'firebase/firestore'
import LogRocket from 'logrocket'
import { useState, useEffect, useContext, createContext } from 'react'
import { auth, db } from './firebase'

export interface UserMetadata {
  class: number | string
  room?: number | string
  name: string
  displayName: string
  email: string
  provider: Provider[]
}

type FirebaseResult = {
  success: boolean
  message?: string
}

export type Provider = 'facebook.com' | 'google.com' | 'password'

interface IAuthContext {
  isPWA: () => boolean
  getToken: () => Promise<string | null>
  user: User | null
  ready: boolean
  remove: () => Promise<boolean>
  metadata: UserMetadata | null
  getMethods: (email: string) => Promise<Provider[]>
  signUp: (email: string, password: string) => Promise<FirebaseResult>
  signIn: (email: string, password: string) => Promise<FirebaseResult>
  signInWithProvider: (provider: Provider) => Promise<boolean>
  signOut: () => Promise<void>
  updateMeta: (meta: UserMetadata) => Promise<boolean>
}

export const authContext = createContext<IAuthContext | undefined>(undefined)

export const useAuth = (): IAuthContext | undefined => {
  return useContext(authContext)
}

// Provider hook that creates auth object and handles state
export function useProvideAuth(): IAuthContext {
  const [user, setUser] = useState<User | null>(null)
  const [metadata, setMetadata] = useState<UserMetadata | null>(null)
  const [ready, setReady] = useState<boolean>(false)

  const isPWA = (): boolean => {
    const isPWA =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches
    if (isPWA) {
      localStorage.setItem('lastPWA', new Date().valueOf().toString())
    }
    return isPWA
  }
  const getToken = async (): Promise<null | string> => {
    if (!user) return null
    return await user.getIdToken()
  }

  const getMethods = async (email: string): Promise<Provider[]> => {
    return (await fetchSignInMethodsForEmail(auth, email)) as Provider[]
  }

  const signUp = async (email: string, password: string): Promise<FirebaseResult> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (err) {
      LogRocket.error(err)
      return { success: false, message: err.code }
    }
  }
  const signIn = async (email: string, password: string): Promise<FirebaseResult> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (err) {
      LogRocket.error(err)
      return { success: false, message: err.code }
    }
  }
  const signInWithProvider = async (p: Provider): Promise<boolean> => {
    let provider
    switch (p) {
      case 'google.com':
        provider = new GoogleAuthProvider()
        break
      case 'facebook.com':
        provider = new FacebookAuthProvider()
        break
      default:
        return false
    }
    try {
      await signInWithPopup(auth, provider)
      return true
    } catch (err) {
      LogRocket.error(err)
      if (err.code === 'auth/popup-closed-by-user') return true
      return false
    }
  }
  const remove = async (): Promise<boolean> => {
    try {
      await user.delete()
      return true
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        await signOut()
        return true
      }
      return false
    }
  }
  const signOut = async (): Promise<void> => {
    await auth.signOut()
  }
  const updateMeta = async (meta: UserMetadata): Promise<boolean> => {
    try {
      meta.name = user.displayName
      meta.email = user.email
      meta.provider = user.providerData.map((p) => p.providerId) as Provider[]
      await setDoc(doc(db, 'users/' + user.uid), meta)
      LogRocket.log('Metadata update', meta)
      setMetadata(meta)
      return true
    } catch (err) {
      return false
    }
  }
  useEffect(() => {
    let _isMounted = true
    let authReady = null
    return auth.onIdTokenChanged(async (user) => {
      if (!_isMounted) return
      if (authReady) clearTimeout(authReady)
      if (user) {
        authReady = setTimeout(() => setReady(false), 1000)
        // Check if user metadata exists.
        LogRocket.identify(user.uid, {
          name: user.displayName,
          email: user.email,
          pwa: isPWA(),
        })
        const meta = await getDoc(doc(db, 'users/' + user.uid))
        if (meta.exists) {
          setMetadata(meta.data() as UserMetadata)
        } else {
          setMetadata(null)
        }
        setUser(user)
        clearTimeout(authReady)
        setReady(true)
      } else {
        authReady = setTimeout(() => setReady(true), 1000)
        setUser(null)
      }
      return () => {
        _isMounted = false
      }
    })
  }, [])
  return {
    user,
    getToken,
    metadata,
    remove,
    ready,
    isPWA,
    getMethods,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    updateMeta,
  }
}
