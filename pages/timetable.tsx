import { ArrowLeftIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import LayoutComponent, { CONTAINER, HEADER } from '../components/layout'
import TimetableComponent from '../components/timetable'

export default function TimetablePage() {
  const router = useRouter()
  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>ตารางสอน - PM-RianArai</title>
        <meta name="description" content="เข้าเรียนทุกวิชาได้จากที่เดียว" />
        <meta property="og:url" content="https://pm-rianarai.vercel.app" />
        <meta property="og:title" content="PM Rianarai - เรียนอะไร" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>
      <LayoutComponent>
        <div className={CONTAINER}>
          <div className={'flex ' + HEADER}>
            <button onClick={() => router.back()} className="focus:outline-none">
              <ArrowLeftIcon className="w-8 h-8" />
            </button>
            <h1 className="pl-4">ตารางสอน</h1>
          </div>
          <div className="bg-gray-100 p-4 rounded flex-grow">
            <TimetableComponent />
          </div>
        </div>
      </LayoutComponent>
    </div>
  )
}