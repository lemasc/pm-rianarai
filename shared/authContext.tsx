import LogRocket from 'logrocket'
import { useState, useEffect, useContext, createContext } from 'react'
import { auth, UserData, db } from './firebase'

export interface UserMetadata {
  class: number | string
  room?: number | string
  name: string
  displayName: string
  email: string
  provider: Provider[]
}
type Provider = 'facebook.com' | 'google.com'

interface IAuthContext {
  isPWA: () => boolean
  getToken: () => Promise<string | null>
  user: UserData | null
  ready: boolean
  remove: () => Promise<boolean>
  metadata: UserMetadata | null
  signout: () => Promise<void>
  updateMeta: (meta: UserMetadata) => Promise<boolean>
}

export const authContext = createContext<IAuthContext | undefined>(undefined)

export const useAuth = (): IAuthContext | undefined => {
  return useContext(authContext)
}

// Provider hook that creates auth object and handles state
export function useProvideAuth(): IAuthContext {
  const [user, setUser] = useState<UserData | null>(null)
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
  const remove = async (): Promise<boolean> => {
    try {
      await user.delete()
      return true
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        await signout()
        return true
      }
      return false
    }
  }
  const signout = async (): Promise<void> => {
    await auth.signOut()
  }
  const updateMeta = async (meta: UserMetadata): Promise<boolean> => {
    try {
      meta.name = user.displayName
      meta.email = user.email
      meta.provider = user.providerData.map((p) => p.providerId) as Provider[]
      await db.collection('users').doc(user.uid).set(meta)
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
        const meta = await db.collection('users').doc(user.uid).get()
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
        setMetadata(null)
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
    signout,
    updateMeta,
  }
}
