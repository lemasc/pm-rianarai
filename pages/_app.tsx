import { AppProps } from 'next/app'
import React from 'react'
import { MainProvider } from '../shared'
import { useAuth } from '../shared/authContext'
import { Transition } from '@headlessui/react'
import Loader from 'react-loader-spinner'
import LogRocket from 'logrocket'

import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import 'tippy.js/dist/tippy.css'

function AuthSpinner(): JSX.Element {
  const auth = useAuth()
  return (
    <Transition
      show={auth && auth.ready ? false : true}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opactity-100"
      leaveTo="opacity-0"
      className="fixed z-10 inset-0 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="z-20 opacity-75">
          <Loader type="ThreeDots" color="#FFFFFF" height={80} width={80} />
        </div>
      </div>
    </Transition>
  )
}
function App({ Component, pageProps }: AppProps): JSX.Element {
  if (process.env.NODE_ENV === 'production') LogRocket.init('sg61xt/pm-rianarai-i4kpt')
  return (
    <MainProvider>
      <AuthSpinner />
      <Component {...pageProps} />
    </MainProvider>
  )
}

export default App
