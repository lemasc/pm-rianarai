import { ReactNode } from 'react'
import { FuegoProvider } from 'swr-firestore-v9'

import { meetingContext, useProvideMeeting } from './meetingContext'
import { useProvideAuth, authContext } from './authContext'
import { fuego } from './firebase'
import { timeslotContext, useProvideTimeslot } from './timeslotContext'

interface IProps {
  children: ReactNode
}

function AuthProvider({ children }: IProps): JSX.Element {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}
function MeetingProvider({ children }: IProps): JSX.Element {
  const meeting = useProvideMeeting()
  return <meetingContext.Provider value={meeting}>{children}</meetingContext.Provider>
}

function TimeSlotProvider({ children }: IProps): JSX.Element {
  const timeslot = useProvideTimeslot()
  return <timeslotContext.Provider value={timeslot}>{children}</timeslotContext.Provider>
}
export function MainProvider({ children }: IProps): JSX.Element {
  return (
    <AuthProvider>
      <FuegoProvider fuego={fuego}>
        <MeetingProvider>
          <TimeSlotProvider>{children}</TimeSlotProvider>
        </MeetingProvider>
      </FuegoProvider>
    </AuthProvider>
  )
}
