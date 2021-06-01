import Head from 'next/head'
import { useAuth } from '../shared/authContext'
import { ReactNode, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import { LogoutIcon, CogIcon } from '@heroicons/react/outline'
import dynamic from 'next/dynamic'
import HeaderComponent from '../components/header'
import Link from 'next/link'

const SignInComponent = dynamic(() => import('../components/signin'))
const MetaDataComponent = dynamic(() => import('../components/meta'))
const TimetableComponent = dynamic(() => import('../components/timetable'))

/**
 * Single Page Application!
 */
interface SPAProps {
  children: ReactNode
  title: string
}

function MultiComponent(props: SPAProps): JSX.Element {
  const [prevState, setPrevState] = useState(props)
  return (
    <Transition
      show={props.title == prevState.title}
      enter="transition duration-700 delay-150"
      enterFrom="opacity-0"
      enterTo="opactity-100"
      leave="transition duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="flex flex-col mb-8 shadow-lg text-center items-center"
      afterLeave={() => setPrevState(props)}
    >
      {prevState.title !== null && (
        <h2 className="border-b border-gray-400 text-black text-xl font-medium py-4 rounded-t-lg bg-gradient-to-br from-paris-daisy-400 to-paris-daisy-600 p-4 w-full">
          {prevState.title}
        </h2>
      )}
      <div
        className={
          'text-black md:px-4 py-4 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 dark:text-gray-200 ' +
          (prevState.title !== null ? 'rounded-b-lg' : 'rounded-lg filter drop-shadow-md')
        }
      >
        {prevState.children}
      </div>
    </Transition>
  )
}

export default function MainPage(): JSX.Element {
  const auth = useAuth()
  const [date, setDate] = useState(new Date())
  const [settings, setSettings] = useState(false)
  const [prompt, setPWAPrompt] = useState<Event | null>(null)
  const [promo, showPromo] = useState(false)
  useEffect(() => {
    const timerID = setInterval(() => {
      setDate(new Date())
    }, 1000)
    return () => clearInterval(timerID)
  })
  useEffect(() => {
    const pwa = (e: Event): void => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      //setPWAPrompt(e)
      // Optionally, send analytics event that PWA install promo was shown.
      console.log(`'beforeinstallprompt' event was fired.`)
      console.log(e)
    }
    window.addEventListener('beforeinstallprompt', pwa)
    return () => window.removeEventListener('beforeinstallprompt', pwa)
  })
  useEffect(() => {
    if (prompt !== null && !localStorage.getItem('pwaPrompt')) {
      // Prompt user for app install
      console.log('SHOW')
      setTimeout(() => showPromo(true), 2000)
    }
  }, [prompt])

  function installPWA() {
    if (prompt !== null) {
      ;(prompt as any).prompt()
    } else {
      // iOS devices doesn't support native prompt
      // Redirect to instructions instead.
      ;(document.querySelector('#pwamore') as HTMLButtonElement).click()
    }
  }
  function renderPage(): JSX.Element {
    if (!(auth && auth.ready)) return null
    let children: JSX.Element = null,
      title: string = null
    if (!auth.user) {
      children = <SignInComponent />
      title = 'เข้าสู่ระบบ'
    }
    if (auth.user && !auth.metadata) {
      title = 'อีกแค่นิดเดียว'
      children = <MetaDataComponent />
    }
    if (settings) {
      title = 'การตั้งค่า'
      children = <MetaDataComponent onSubmit={() => setSettings(false)} />
    }
    if (children === null) {
      // No page matched, load Main Time component
      children = <TimetableComponent />
    }
    return <MultiComponent title={title}>{children}</MultiComponent>
  }
  return (
    <div className="background-default overflow-hidden text-white min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>PM-RianArai</title>
        <meta name="description" content="เข้าเรียนทุกวิชาได้จากที่เดียว" />
        <meta property="og:url" content="https://pm-rianarai.vercel.app" />
        <meta property="og:title" content="PM Rianarai - เรียนอะไร" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>
      <div className="p-6 opacity-50 hidden sm:block absolute top-0 left-0 creative-font text-2xl">
        {date.toLocaleTimeString('th-TH')}
      </div>
      {auth.user && auth.metadata && (
        <div className="flex flex-row absolute top-0 right-0 p-4 sm:p-6 space-x-4">
          <button
            title="การตั้งค่า"
            className="focus:outline-none"
            onClick={() => setSettings(true)}
          >
            <CogIcon
              className="sm:w-10 sm:h-10 w-8 h-8 font-light opacity-60 hover:opacity-100"
              strokeWidth={1}
            />
          </button>
          <button
            title="ออกจากระบบ"
            className="focus:outline-none"
            onClick={() => {
              setSettings(false)
              if (auth.metadata) return auth.signout()
              auth.remove().then((ok) => {
                if (!ok) auth.signout()
              })
            }}
          >
            <LogoutIcon
              className="sm:w-10 sm:h-10 w-8 h-8 font-light opacity-60 hover:opacity-100"
              strokeWidth={1}
            />
          </button>
        </div>
      )}
      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent />
        {renderPage()}
        <Transition
          show={promo && (auth.user == null || (auth.metadata != null && !settings))}
          enter="transition duration-700 delay-150"
          enterFrom="opacity-0"
          enterTo="opactity-100"
          leave="transition duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="mb-8 text-sm sm:flex-row flex-col flex items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded shadow-md"
        >
          <h2 className="text-lg">รู้มั้ย?</h2>
          <span className="font-light py-1 sm:w-auto w-44 text-center">
            สามารถติดตั้งแอปพลิเคชั่นเพื่อให้เข้าใช้งานได้เร็วขึ้นด้วยนะ
          </span>
          <button
            onClick={() => installPWA()}
            className="text-black px-4 py-2 bg-gray-100 from-gray-100 to-gray-200 focus:bg-gradient-to-b hover:bg-gradient-to-b focus:outline-none rounded"
          >
            ติดตั้งเลย
          </button>
          <Link href="/install">
            <a
              id="pwamore"
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal underline"
            >
              เรียนรู้เพิ่มเติม
            </a>
          </Link>
        </Transition>
      </main>

      <footer className="bg-white bg-opacity-30 text-black text-sm gap-2 flex flex-col justify-center items-center w-full p-8 border-t">
        <div className="flex flex-row justify-center text-center items-center w-full space-x-4">
          <Link href="/about">
            <a target="_blank" rel="noopener noreferrer" className="font-normal underline">
              เกี่ยวกับเว็บไซต์นี้
            </a>
          </Link>
          <Link href="/support">
            <a target="_blank" rel="noopener noreferrer" className="font-normal underline">
              แจ้งปัญหาการใช้งาน / ติดต่อ
            </a>
          </Link>
        </div>

        <span className="text-gray-800">Producted By Lemasc</span>
      </footer>
    </div>
  )
}
