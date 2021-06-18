import Head from 'next/head'
import LayoutComponent, { CONTAINER, HEADER } from '../components/layout'
import MetadataComponent from '../components/meta'

export default function SettingsPage() {
  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>PM-RianArai</title>
        <meta name="description" content="เข้าเรียนทุกวิชาได้จากที่เดียว" />
        <meta property="og:url" content="https://pm-rianarai.vercel.app" />
        <meta property="og:title" content="PM Rianarai - เรียนอะไร" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>
      <LayoutComponent>
        <div className={'flex-1 ' + CONTAINER}>
          <h1 className={HEADER}>งานที่ได้รับ</h1>
          <div className="pb-20 font-light flex flex-col flex-1 items-center justify-center space-y-4">
            <span>ยังไม่ได้เชื่อมต่อกับ Google Classroom</span>
            <button className="btn text-white px-4 py-2 bg-apple-500 from-apple-500 to-apple-600 ring-apple-500">
              เชื่อมต่อกับ Classroom
            </button>
          </div>
        </div>
      </LayoutComponent>
    </div>
  )
}
