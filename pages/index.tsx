import Head from 'next/head'
import { useAuth } from '../shared/authContext'
import { ReactNode, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import dynamic from 'next/dynamic'
import HeaderComponent from '../components/header'
import type { Pages } from '../components/menu'
import { useWindowWidth } from '@react-hook/window-size/throttled'

const SignInComponent = dynamic(() => import('../components/signin'))
const MetaDataComponent = dynamic(() => import('../components/meta'))
const TimeSlotsComponent = dynamic(() => import('../components/timeslots'))
const MenuComponent = dynamic(() => import('../components/menu'))
const PWAPromoComponent = dynamic(() => import('../components/pwa'))
const TimeTableComponent = dynamic(() => import('../components/timetable'))
const AnnouncementComponent = dynamic(() => import('../components/announce'))

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
      enter="transition duration-700"
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
  const [page, setPage] = useState<Pages>(null)
  const width = useWindowWidth({ initialWidth: 1360 })

  useEffect(() => {
    const timerID = setInterval(() => {
      setDate(new Date())
    }, 1000)
    return () => clearInterval(timerID)
  })

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
    if (page == 'settings') {
      title = 'การตั้งค่า'
      children = <MetaDataComponent onSubmit={() => setPage(null)} />
    }
    if (page == 'timetable') {
      title = 'ตารางเรียน'
      children = <TimeTableComponent />
    }
    if (children === null) {
      // No page matched, load Main Time component
      children = <TimeSlotsComponent />
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
      {width >= 640 && (
        <div
          suppressHydrationWarning
          className="p-6 opacity-50 absolute top-0 left-0 creative-font text-2xl"
        >
          {date.toLocaleTimeString('th-TH')}
        </div>
      )}
      {auth.ready && <MenuComponent onChange={setPage} page={page} />}

      <main className={'flex flex-1 flex-col w-full items-center justify-center'}>
        <HeaderComponent />
        {renderPage()}
        <PWAPromoComponent show={true} />
        <AnnouncementComponent show={page === 'announce'} onClose={() => setPage(null)} />
      </main>

      <footer className="bg-white bg-opacity-30 text-black text-sm gap-2 flex flex-col justify-center items-center w-full p-8 border-t mx-8">
        <div className="flex flex-row justify-center text-center items-center w-full space-x-4">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="font-normal underline"
          >
            เกี่ยวกับเว็บไซต์นี้
          </a>
          <a
            href="/support"
            target="_blank"
            rel="noopener noreferrer"
            className="font-normal underline"
          >
            แจ้งปัญหาการใช้งาน / ติดต่อ
          </a>
        </div>

        <span className="text-gray-800">Producted By Lemasc</span>
      </footer>
    </div>
  )
}
