import React, { ReactNode } from 'react'
import { useProvideAuth, authContext } from './authContext'
import { FuegoProvider } from '@nandorojo/swr-firestore'
import { Fuego } from './firebase'
import { meetingContext, useProvideMeeting } from './meetingContext'

interface IProps {
  children: ReactNode
}

function AuthProvider({ children }: IProps): JSX.Element {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}
function MeetingProvier({ children }: IProps): JSX.Element {
  const meeting = useProvideMeeting()
  return <meetingContext.Provider value={meeting}>{children}</meetingContext.Provider>
}
export function MainProvider({ children }: IProps): JSX.Element {
  return (
    <AuthProvider>
      <FuegoProvider fuego={new Fuego()}>
        <MeetingProvier>{children}</MeetingProvier>
      </FuegoProvider>
    </AuthProvider>
  )
}
