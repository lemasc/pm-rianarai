import { Document, useCollection } from 'swr-firestore-v9'
import LogRocket from 'logrocket'
import { createContext, useContext, useState } from 'react'
import { useAuth } from './authContext'

export interface Meeting {
  code?: string
  meeting: string
  name: string
  subject: string
  url?: string
  meet?: boolean
}
export interface IMeetingContext {
  ready: boolean
  error: any
  meeting: Document<Meeting>[]
  add: (name: string) => void
  clear: () => void
  launchMeeting: (meeting: Meeting) => void
}

export const meetingContext = createContext<IMeetingContext | undefined>(undefined)

export const useMeeting = (): IMeetingContext => {
  const ctx = useContext(meetingContext)
  if (!ctx) throw new Error('useMeeting must be within MeetingProvider')
  return ctx
}

export function useProvideMeeting(): IMeetingContext {
  const { user } = useAuth()
  const [names, setNames] = useState<Set<string>>(new Set([]))
  const [ready, setReady] = useState(false)

  const { data: meeting, error } = useCollection<Meeting>(
    user ? `meetings` : null,
    {
      where: ['name', 'in', names.size === 0 ? [''] : Array.from(names)],
      listen: true,
    },
    {
      onSuccess: () => setReady(true),
    }
  )

  const add = (name: string): void => {
    if (!names.has(name)) {
      setReady(false)
      setNames((prev) => new Set(prev.add(name)))
    }
  }

  const clear = (): void => {
    setReady(false)
    setNames(new Set())
  }

  /**
   * Get the encoded meeting passcode from Zoom Instant Meetings URL
   * @param url Zoom Meeting URL
   * @returns Encoded passcode
   */
  const getCodeFromUrl = (url: string): string | null => {
    const urlConst = new URL(url)
    if (!urlConst.hostname.includes('zoom.us')) return null
    const params = new URLSearchParams(urlConst.search)
    if (!params.has('pwd')) return null
    return params.get('pwd')
  }
  const isMobile = (): boolean => {
    // Fix macOS Safari AND IPAD
    return !(/Windows/i.test(navigator.userAgent))
  }
  const dynamicLink = (meeting: string, code: string): void => {
    const params = new URLSearchParams({ confno: meeting, pwd: code })
    const host = isMobile() ? 'zoomus://zoom.us/join?' : 'zoommtg://zoom.us/join?'
    LogRocket.track('Launch Meeting')
    window.location.replace(host + params.toString())
  }
  /**
   * Launch meeting based on the given data
   * @param meeting Meeting data
   */
  const launchMeeting = (meeting: Meeting): void => {
    let code = meeting.code
    if (meeting.url && getCodeFromUrl(meeting.url)) {
      code = getCodeFromUrl(meeting.url)
    }
    dynamicLink(meeting.meeting, code)
  }

  return {
    ready,
    add,
    clear,
    meeting,
    launchMeeting,
    error,
  }
}
