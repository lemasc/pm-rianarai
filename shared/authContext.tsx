import { useState, useEffect, useContext, createContext } from 'react'
import axios from 'axios'
import { Document, useDocument } from 'swr-firestore-v9'
import { loadBundle } from 'firebase/firestore'
import { GoogleAuthProvider, signInWithCredential, User } from 'firebase/auth'

import { FirebaseResult, Provider, UserMetadata } from '@/types/auth'
import { auth } from './firebase'
import { db as pluginDb } from './plugin'
import { withAnalytics } from './analytics'
import { setUserId } from '@firebase/analytics'
import { createEventListener, emitEvent, sendEvent } from './native'
import { AuthChangeEvent, GoogleSignInResult } from '@/shared-types/auth'
import { useRouter } from 'next/router'

interface IAuthContext {
  endpoint: string | undefined
  user: User | null
  ready: boolean
  bundle: boolean
  remove: () => Promise<boolean>
  // announce: Document<Announcement>[]
  // markAsRead: (announceId: string) => Promise<void>
  metadata: Document<UserMetadata>
  signInWithGoogle: () => Promise<FirebaseResult>
  signOut: () => Promise<void>
  updateMeta: (meta: UserMetadata) => Promise<boolean>
}

export const authContext = createContext<IAuthContext | undefined>(undefined)

export const useAuth = (): IAuthContext | undefined => {
  return useContext(authContext)
}

// Provider hook that creates auth object and handles state
export function useProvideAuth(): IAuthContext {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState<boolean>(false)
  const [bundle, setBundle] = useState(false)
  const [endpoint, setEndpoint] = useState<string | undefined>()
  const [metadata, setMetadata] = useState(undefined)
  const { data: _metadata, set } = useDocument<UserMetadata>(user ? `users/${user.uid}` : null, {
    listen: true,
  })
  /**
   * SWR-Firestore always return a document.
   * We want SWR style (null if not exists, undefined if loading).
   * Add a wrapper instead.
   */
  useEffect(() => {
    setMetadata(_metadata !== undefined ? (_metadata?.exists ? _metadata : null) : undefined)
  }, [_metadata])

  /* const { data: announce } = useCollection<Announcement>(ready ? 'announcement' : null, {
    where: [['enable', '==', true], ...(!user ? [] : ([['needs_login', '==', false]] as any))],
    orderBy: ['created_at', 'desc'],
    parseDates: ['created_at', 'released_at'],
    listen: true,
  })
*/
  useEffect(() => {
    let time = undefined
    if (time) clearTimeout(time)
    time = setTimeout(() => {
      console.log('Ready,', user == null || metadata !== undefined)
      setReady(true)
    }, 1000)
  }, [user, metadata])

  useEffect(() => {
    const unsubscribe = createEventListener<string>('api-endpoint', (endpoint) => {
      axios.defaults.baseURL = endpoint
      setEndpoint(endpoint)
    })
    return () => unsubscribe()
  }, [user, metadata])

  useEffect(() => {
    if (!metadata || !user) return
    ;(async () => {
      try {
        const wpmBundle = await axios.get(
          `${process.env.NEXT_PUBLIC_PLUGIN_ENDPOINT}/api/client/bundle/${metadata.class}`,
          {
            headers: {
              Authorization: `Bearer ${await user.getIdToken(true)}`,
            },
            responseType: 'arraybuffer',
          }
        )
        await loadBundle(pluginDb, wpmBundle.data)
        setBundle(true)
      } catch (err) {
        setBundle(false)
      }
    })()
  }, [metadata, bundle, user])

  const signInWithGoogle = async (): Promise<FirebaseResult> => {
    const { success, token, message } = (await sendEvent('sign-in')) as GoogleSignInResult
    if (success && token) {
      signInWithCredential(auth, GoogleAuthProvider.credential(token.id_token))
    }
    return {
      success,
      message,
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
  const signOut = async (noPrompt?: boolean): Promise<void> => {
    // We don't sign out users immediately.
    // Ask the users before continuing.
    if (!noPrompt) {
      const result = await sendEvent('log-out')
      if (!result) return
    }
    await auth.signOut()
    setUser(null)
  }

  useEffect(() => {
    const unsubscribe = createEventListener('log-out', () => {
      signOut(true)
    })
    return () => unsubscribe()
  }, [])

  const updateMeta = async (meta: UserMetadata): Promise<boolean> => {
    try {
      meta.name = user.displayName
      meta.email = user.email
      meta.provider = user.providerData.map((p) => p.providerId) as Provider[]
      if (metadata && metadata.announceId) {
        meta.announceId = metadata.announceId //Preserve fields
      }
      if (metadata && metadata.upgrade) meta.upgrade = metadata.upgrade
      await set(meta)
      return true
    } catch (err) {
      return false
    }
  }

  useEffect(() => {
    let _isMounted = true
    return auth.onIdTokenChanged(async (curUser) => {
      if (!_isMounted) return
      if (curUser) {
        if (user?.uid !== curUser?.uid) setReady(false)
        setUser(curUser)
        /*       // Check if user metadata exists.
        const meta = await getDoc(doc(db, 'users/' + curUser.uid))
        if (meta.exists()) {
          setMetadata(meta.data() as UserMetadata)
        } else {
          setMetadata(null)
        }*/
        withAnalytics((a) => setUserId(a, curUser.uid))
        emitEvent<AuthChangeEvent>('auth-changed', {
          token: await curUser.getIdToken(),
        })
      } else {
        setUser(null)
        emitEvent<AuthChangeEvent>('auth-changed')
        //router.replace('/')
      }
      return () => {
        _isMounted = false
      }
    })
  }, [user, router])

  return {
    user,
    endpoint,
    metadata,
    remove,
    ready,
    bundle,
    signInWithGoogle,
    signOut,
    updateMeta,
  }
}
