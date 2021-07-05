import Head from 'next/head'
import { useAuth } from '@/shared/authContext'
import LayoutComponent from '@/components/layout'
import Dashboard from '@/components/dashboard'

export default function MainPage(): JSX.Element {
  const { ready, user, metadata } = useAuth()
  return (
    <div
      className={
        'justify-center overflow-hidden min-h-screen flex flex-col items-center dark:bg-gray-900 dark:text-white' +
        (ready && (metadata ? '' : ' background-hero'))
      }
    >
      <Head>
        <title>PM-RianArai</title>
        <meta name="title" content="PM-RianArai : เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
        <meta
          name="description"
          content="PM-RianArai เว็บไซต์สำหรับนักเรียนโรงเรียนมัธยมสาธิตวัดพระศรีมหาธาตุ ที่จะทำให้การเข้าเรียนเป็นทุกรายวิชาเป็นเรื่องง่าย รวบรวมทุกอย่างไว้ในที่เดียว"
        />
        <meta property="og:url" content="https://pm-rianarai.vercel.app" />
        <meta property="og:title" content="PM RianArai - เรียนอะไร" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>
      <LayoutComponent>{ready && <>{user && metadata && <Dashboard />}</>}</LayoutComponent>
      {/*<PWAPromoComponent show={ready && !metadata} />
      
      */}
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
