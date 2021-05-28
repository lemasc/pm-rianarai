import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { auth } from '../shared/firebase'
import firebase from 'firebase/app'

export default function SignInComponent(): JSX.Element {
  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: () => false,
    },
  }
  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
}
