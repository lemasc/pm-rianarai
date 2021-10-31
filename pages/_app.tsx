import { AppProps } from 'next/app'
import { MainProvider, shouldLoadPage } from '@/shared/index'
//import AuthSpinner from '@/components/auth/spinner'
import LogRocket from 'logrocket'
import MaintenancePage from './maintenance'

import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import 'tippy.js/dist/tippy.css'
import '../styles/react-tabs.css'
import 'react-circular-progressbar/dist/styles.css'
import { useRouter } from 'next/router'

function App({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter()
  if (process.env.NODE_ENV === 'production') LogRocket.init('sg61xt/pm-rianarai-i4kpt')

  if (shouldLoadPage || router.pathname == '/about' || router.pathname == '/support')
    return (
      <MainProvider>
        <Component {...pageProps} />
      </MainProvider>
    )
  return (
    <MainProvider>
      <MaintenancePage {...pageProps} />
    </MainProvider>
  )
}

export default App
