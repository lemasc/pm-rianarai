import { ReactNode, useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Transition } from '@headlessui/react'
import { useAuth } from '@/shared/authContext'
import LayoutComponent from '@/components/layout'

const Dashboard = dynamic(() => import('@/components/dashboard'))
const MetaDataComponent = dynamic(() => import('@/components/auth/meta'))
const SignInComponent = dynamic(() => import('@/components/auth/signin'))
const PWAPromoComponent = dynamic(() => import('@/components/pwa'))

interface SPAProps {
  children: ReactNode
  title?: string
  desc?: string
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
      className="flex flex-col text-center items-center"
      afterLeave={() => setPrevState(props)}
    >
      <div className="px-4 m-4 w-full">
        {prevState.title && (
          <h2 className="text-2xl font-bold py-4 creative-font">{prevState.title}</h2>
        )}
        {prevState.desc && <span className="py-4 font-light">{prevState.desc}</span>}
      </div>
      <div className="w-full p-4 bg-gray-100">{prevState.children}</div>
    </Transition>
  )
}

export default function MainPage(): JSX.Element {
  const { ready, user, metadata } = useAuth()
  const [hero, showHero] = useState(false)
  useEffect(() => {
    if (!ready || metadata) return
    setTimeout(() => showHero(true), 1500)
  }, [ready, metadata])
  return (
    <div
      className={
        'justify-center overflow-hidden min-h-screen flex flex-col items-center dark:bg-gray-900 dark:text-white' +
        (ready && (metadata ? '' : ' background-hero'))
      }
    >
      <Head>
        <title>
          {ready ? (user && metadata ? 'หน้าหลัก' : 'ยินดีต้อนรับ') + ' : ' : ''}
          PM-RianArai
        </title>
        <meta name="title" content="PM-RianArai : เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
        <meta
          name="description"
          content="PM-RianArai เว็บไซต์สำหรับนักเรียนโรงเรียนมัธยมสาธิตวัดพระศรีมหาธาตุ ที่จะทำให้การเข้าเรียนเป็นทุกรายวิชาเป็นเรื่องง่าย รวบรวมทุกอย่างไว้ในที่เดียว"
        />
        <meta property="og:url" content="https://pm-rianarai.vercel.app" />
        <meta property="og:title" content="PM RianArai - เรียนอะไร" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>
      <LayoutComponent>
        {ready && (
          <>
            {user && metadata ? (
              <Dashboard />
            ) : (
              <>
                <Transition
                  show={hero}
                  className="md:absolute left-20 top-8 flex flex-col text-white space-y-6 xl:px-8 md:px-0 px-8 py-8 md:items-start items-center xl:max-w-2xl lg:max-w-lg md:max-w-md font-light"
                >
                  <Transition.Child
                    as="h1"
                    enter="transform transition duration-700"
                    enterFrom="opacity-50 scale-150"
                    enterTo="opactity-100 scale-100"
                    className="text-4xl font-medium filter drop-shadow-xl md:text-left text-center"
                  >
                    เครื่องมือเดียวสำหรับการเรียนออนไลน์
                  </Transition.Child>
                  <Transition.Child
                    as="div"
                    enter="transition-opacity ease-linear duration-700 delay-1000"
                    enterFrom="opacity-0"
                    enterTo="opactity-100"
                    className="flex flex-col flex-1 space-y-6 md:items-start items-center justify-center"
                  >
                    <p className="md:text-left md:px-0 px-8 text-center filter">
                      จะมานั่งกรอกรหัสซ้ำ ๆ ทุกคาบเรียนทำไม เพียงแค่ 3 ขั้นตอน
                      คุณก็สามารถเริ่มต้นเข้าเรียนออนไลน์ ดูตารางสอน จัดการงานที่ได้รับมอบหมาย
                      ได้ทุกวิชา ทุกระดับชั้น และทุกอุปกรณ์
                    </p>
                    <p className="text-center text-white font-medium">
                      และใช่ ทั้งหมดนั่นรวมอยู่ในนี้ให้คุณแล้ว
                    </p>
                  </Transition.Child>
                </Transition>
                <div className="mb-16 rounded-lg border shadow-xl flex flex-col bg-white text-black items-center justify-start">
                  {user ? (
                    <>
                      <MultiComponent title="ขั้นตอนสุดท้ายเท่านั้น">
                        <MetaDataComponent minUI={true} />
                      </MultiComponent>
                    </>
                  ) : (
                    <MultiComponent
                      title="ยินดีต้อนรับ"
                      desc="เข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้นใช้งาน"
                    >
                      <SignInComponent />
                    </MultiComponent>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </LayoutComponent>
      <PWAPromoComponent show={ready && !metadata} />
      {ready && !metadata && (
        <footer className="bottom-0 bg-white bg-opacity-30 text-black text-sm gap-2 flex flex-col justify-center items-center w-full p-8 border-t">
          <div className="flex flex-row justify-center text-center items-center w-full space-x-4">
            <a href="/about" target="_blank" rel="noopener" className="font-normal underline">
              เกี่ยวกับเรา
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

          <span className="text-gray-800">Version 2.0 (@next)</span>
        </footer>
      )}
    </div>
  )
}
