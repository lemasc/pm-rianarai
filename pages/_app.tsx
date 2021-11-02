import Head from 'next/head'
import { AppProps } from 'next/app'
import LayoutComponent from '@/components/layout'
import { MainProvider } from '@/shared/index'

import 'tailwindcss/tailwind.css'
import '../fonts/index.css'
import '../styles/globals.css'
import '../styles/content.css'
import '../styles/react-tabs.css'
import 'react-loading-skeleton/dist/skeleton.css'
import { useRouter } from 'next/router'

function App({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>RianArai</title>
      </Head>
      <MainProvider>
        {router.pathname === '/splash' ? (
          <Component {...pageProps} />
        ) : (
          <LayoutComponent>
            <Component {...pageProps} />
          </LayoutComponent>
        )}
      </MainProvider>
    </>
  )
}

export default App
