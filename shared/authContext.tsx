import { useState, useEffect, useContext, createContext } from 'react'
import axios from 'axios'
import LogRocket from 'logrocket'
import { useCollection, Document } from 'swr-firestore-v9'
import { useRouter } from 'next/router'
import { getDoc, setDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { signInWithCustomToken, User } from 'firebase/auth'
import { ipcRenderer } from 'electron'

import { ClassroomSessionResult } from '@/types/classroom'
import { Provider, UserMetadata } from '@/types/auth'
import { Announcement } from '@/types/announce'
import { auth, db } from './firebase'

type FirebaseResult = {
  success: boolean
  message?: string
}

interface IAuthContext {
  isPWA: () => boolean
  user: User | null
  ready: boolean
  setWelcome: (state: boolean) => Promise<void>
  classroom: ClassroomSessionResult[] | null
  announce: Document<Announcement>[]
  markAsRead: (announceId: string) => Promise<void>
  metadata: UserMetadata
  signIn: (email: string, password: string) => Promise<FirebaseResult>
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
  const [metadata, setMetadata] = useState<UserMetadata>(undefined)
  const [ready, setReady] = useState<boolean>(false)
  const [classroom, setClassroom] = useState<ClassroomSessionResult[] | null>(null)
  const { data: announce } = useCollection<Announcement>(ready ? 'announcement' : null, {
    where: [
      ['enable', '==', true],
      ['needs_login', '!=', !user ? true : ''],
    ],
    orderBy: [
      ['needs_login', 'asc'],
      ['created_at', 'desc'],
    ],
    parseDates: ['created_at', 'released_at'],
    listen: true,
  })
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

  const signIn = async (token: string): Promise<FirebaseResult> => {
    try {
      await signInWithCustomToken(auth, token)
      return { success: true }
    } catch (err) {
      LogRocket.error(err)
      return { success: false, message: err.code }
    }
  }

  const signOut = async (): Promise<void> => {
    // We don't sign out users immediately.
    // Ask the users before continuing.
    const result = ipcRenderer.sendSync('log-out')
    if (!result) return
    await auth.signOut()
    setUser(null)
    setMetadata(undefined)
  }
  const updateMeta = async (meta: UserMetadata): Promise<boolean> => {
    try {
      meta.name = user.displayName
      meta.email = user.email
      meta.provider = user.providerData.map((p) => p.providerId) as Provider[]
      if (metadata && metadata.announceId) {
        meta.announceId = metadata.announceId //Preserve fields
      }
      if (metadata && metadata.upgrade) meta.upgrade = metadata.upgrade
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

    async function checkClassroom(token: string): Promise<void> {
      try {
        const api = await axios.get('/api/classroom/session', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
        setClassroom(api.data.data)
      } catch (err) {
        console.error(err)
        setClassroom([])
      }
    }
    // We have a dedicated sign-in page, so no web redirect happens.
    return auth.onIdTokenChanged(async (curUser) => {
      if (!_isMounted) return
      if (authReady) clearTimeout(authReady)
      if (curUser) {
        // Check previous state if user exists
        if (curUser !== user) {
          setReady(false)
        } else {
          authReady = setTimeout(() => setReady(false), 1000)
        }
        // Check if user metadata exists.
        LogRocket.identify(curUser.uid, {
          name: curUser.displayName,
          email: curUser.email,
          pwa: isPWA(),
        })
        const meta = await getDoc(doc(db, 'users/' + curUser.uid))
        if (meta.exists) {
          setMetadata(meta.data() as UserMetadata)
          checkClassroom(await curUser.getIdToken())
        } else {
          setMetadata(null)
        }
        setUser(curUser)
        clearTimeout(authReady)
        ipcRenderer.send(
          'auth-changed',
          JSON.stringify({
            ready: true,
            login: false,
          })
        )
        setReady(true)
      } else {
        authReady = setTimeout(() => {
          setReady(true)
        }, 1000)
        ipcRenderer.send(
          'auth-changed',
          JSON.stringify({
            ready: true,
            login: true,
          })
        )
        setUser(null)
      }
      return () => {
        _isMounted = false
      }
    })
  }, [router, user])

  const markAsRead = async (announceId: string): Promise<void> => {
    if (!user) return
    const currentIds = new Set(metadata.announceId !== undefined ? metadata.announceId : [])
    currentIds.add(announceId)
    await updateDoc(doc(db, 'users/' + user.uid), {
      announceId: arrayUnion(announceId),
    })
    setMetadata((meta) => ({ ...meta, announceId: Array.from(currentIds) }))
  }
  const setWelcome = async (state: boolean): Promise<void> => {
    if (!user) return
    await updateDoc(doc(db, 'users/' + user.uid), {
      upgrade: 'v2',
    })
    setMetadata((meta) => ({ ...meta, update: 'v2' }))
  }
  return {
    user,
    announce,
    markAsRead,
    metadata,
    setWelcome,
    classroom,
    ready,
    isPWA,
    signIn,
    signOut,
    updateMeta,
  }
}
