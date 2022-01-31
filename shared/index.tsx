import { ReactNode } from 'react'
import { FuegoProvider } from 'swr-firestore-v9'

import { meetingContext, useProvideMeeting } from './meetingContext'
import { useProvideAuth, authContext } from './authContext'
import { fuego } from './firebase'
import { InsiderProvider } from './insider'

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
      <FuegoProvider fuego={fuego}>
        <MeetingProvier>
          <InsiderProvider>{children}</InsiderProvider>
        </MeetingProvier>
      </FuegoProvider>
    </AuthProvider>
  )
}
