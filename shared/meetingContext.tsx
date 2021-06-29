import { Document, useCollection, useDocument } from 'swr-firestore-v9'
import LogRocket from 'logrocket'
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './authContext'

export interface Schedule {
  [days: string]: TimeSlots[]
}

export interface TimeSlots {
  start: string
  end: string
  teacher: string[]
  code: string[]
}

export interface Meeting {
  code?: string
  meeting: string
  name: string
  subject: string
  url?: string
  meet?: boolean
}
export interface IMeetingContext {
  /**
   * Indicates Meeting data ready state.
   */
  ready: boolean
  /**
   * Current day. (Sunday, Monday, ...)
   */
  curDay: string
  /**
   * The global Date instance, shared between components.
   */
  date: Date
  /**
   * Current user's time schedule document
   */
  schedule: Document<Schedule>
  /**
   * Meeting database; dynamic query via `add` and `clear` commands.
   */
  meeting: Document<Meeting>[]
  /**
   * Add teacher to the meeting database.
   * @param name Teacher name
   */
  add: (name: string) => void
  /**
   * Clear all teachers from the meeting database.
   */
  clear: () => void
  /**
   * Launch the meetings on the user's device.
   * @param meeting Prefered meeting
   */
  launchMeeting: (meeting: Meeting) => void
  /**
   * Check whether the target device is running iOS
   */
  isiOS: () => boolean
}

export const meetingContext = createContext<IMeetingContext | undefined>(undefined)

export const useMeeting = (): IMeetingContext => {
  const ctx = useContext(meetingContext)
  if (!ctx) throw new Error('useMeeting must be within MeetingProvider')
  return ctx
}

export function useProvideMeeting(): IMeetingContext {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const { metadata } = useAuth()
  const [names, setNames] = useState<Set<string>>(new Set([]))
  const [ready, setReady] = useState(false)
  const [date, setDate] = useState(new Date())
  const [curDay, setCurDay] = useState<string>('sunday')

  useEffect(() => {
    const timerID = setInterval(() => {
      const d = new Date()
      setDate(d)
      setCurDay(days[d.getDay()])
    }, 1000)
    return () => clearInterval(timerID)
  })

  const { data: meeting } = useCollection<Meeting>(
    metadata ? `meetings` : null,
    {
      where: ['name', 'in', names.size === 0 ? [''] : Array.from(names)],
      listen: true,
    },
    {
      onSuccess: () => setReady(true),
    }
  )
  const { data: schedule } = useDocument<Schedule>(metadata ? `classes/${metadata.class}` : null, {
    listen: true,
  })

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

  const getCodeFromUrl = (url: string): string | null => {
    const urlConst = new URL(url)
    if (!urlConst.hostname.includes('zoom.us')) return null
    const params = new URLSearchParams(urlConst.search)
    if (!params.has('pwd')) return null
    return params.get('pwd')
  }
  const isiOS = (): boolean => {
    return !/Android/i.test(navigator.userAgent) && isMobile()
  }
  const isMobile = (): boolean => {
    return !/Windows/i.test(navigator.userAgent)
  }
  const dynamicLink = (meeting: string, code: string): void => {
    const params = new URLSearchParams({ confno: meeting, pwd: code })
    const host = isMobile() ? 'zoomus://zoom.us/join?' : 'zoommtg://zoom.us/join?'
    LogRocket.track('Launch Meeting')
    window.location.replace(host + params.toString())
  }
  const launchMeeting = (meeting: Meeting): void => {
    let code = meeting.code
    if (meeting.url && getCodeFromUrl(meeting.url)) {
      code = getCodeFromUrl(meeting.url)
    }
    dynamicLink(meeting.meeting, code)
  }

  return {
    date,
    curDay,
    ready,
    add,
    clear,
    meeting,
    schedule,
    launchMeeting,
    isiOS,
  }
}
