import { Document, useCollection } from '@nandorojo/swr-firestore'
import LogRocket from 'logrocket'
import { createContext, useContext } from 'react'
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
  error: boolean
  data: Document<Meeting>[]
  getMeetingByName: (name: string) => Document<Meeting>[]
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

  const { data, error } = useCollection<Meeting>(user ? `meetings` : null, {
    listen: true,
  })
  /**
   * Get meeting data from the given teacher name
   * @param name Teacher Name
   * @returns First meeting data that matches
   */
  const getMeetingByName = (name: string): Document<Meeting>[] | null => {
    if (!data) return null
    const result = data.filter((d) => d.name.includes(name))
    if (result.length == 0) return [null]
    return result
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
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
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
    getMeetingByName,
    launchMeeting,
    error,
    data,
  }
}
