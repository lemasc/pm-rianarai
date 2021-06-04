import { AppProps } from 'next/app'
import React from 'react'
import { MainProvider } from '../shared'
import LogRocket from 'logrocket'

import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import 'tippy.js/dist/tippy.css'
import '../styles/react-tabs.css'

function App({ Component, pageProps }: AppProps): JSX.Element {
  if (process.env.NODE_ENV === 'production') LogRocket.init('sg61xt/pm-rianarai-i4kpt')
  return (
    <MainProvider>
      <Component {...pageProps} />
    </MainProvider>
  )
}
export default App
