import { AppProps } from 'next/app'
import { MainProvider } from '@/shared/index'
import axios from 'axios'

import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import 'tippy.js/dist/tippy.css'
import '../styles/react-tabs.css'

function App({ Component, pageProps }: AppProps): JSX.Element {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_ENDPOINT
  return (
    <MainProvider>
      <Component {...pageProps} />
    </MainProvider>
  )
}

export default App
