import { AppProps } from 'next/app'
import { MainProvider } from '@/shared/index'
import AuthSpinner from '@/components/auth/spinner'
import LogRocket from 'logrocket'
//import MaintenancePage from './maintenance'

import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import 'tippy.js/dist/tippy.css'
import '../styles/react-tabs.css'

function App({ Component, pageProps }: AppProps): JSX.Element {
  if (process.env.NODE_ENV === 'production') LogRocket.init('sg61xt/pm-rianarai-i4kpt')
  /*
  // Under maintenance, disable all provider and just load the screen.
  return <MaintenancePage />
   */
  return (
    <MainProvider>
      <AuthSpinner />
      <Component {...pageProps} />
    </MainProvider>
  )
}

export default App
