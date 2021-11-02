import { createContext, useContext, useEffect, useState } from 'react'

import { TimeSlots } from '@/types/meeting'
import { withAnalytics, logEvent } from './analytics'
import { Meeting } from '@/shared-types/classroom'

export interface Schedule {
  [days: string]: TimeSlots[]
}

export const isiOS = (): boolean => {
  return !/Android/i.test(navigator.userAgent) && isMobile()
}
export const isMobile = (): boolean => {
  return !/Windows/i.test(navigator.userAgent)
}
export default function launchMeeting(meeting: Meeting) {
  const dynamicLink = (meeting: string, code: string): void => {
    const params = new URLSearchParams({ confno: meeting, pwd: code })
    const host = isMobile() ? 'zoomus://zoom.us/join?' : 'zoommtg://zoom.us/join?'
    withAnalytics((a) =>
      logEvent(a, 'dynamic_link', {
        isMobile: isMobile(),
        isiOS: isiOS(),
      })
    )
    window.location.replace(host + params.toString())
  }
  const getCodeFromUrl = (url: string): string | null => {
    const urlConst = new URL(url)
    if (!urlConst.hostname.includes('zoom.us')) return null
    const params = new URLSearchParams(urlConst.search)
    if (!params.has('pwd')) return null
    return params.get('pwd')
  }
  let code = meeting.code
  if (meeting.url && getCodeFromUrl(meeting.url)) {
    code = getCodeFromUrl(meeting.url)
  }
  dynamicLink(meeting.id, code)
}
