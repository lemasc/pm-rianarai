import Head from 'next/head'
import LayoutComponent, { CONTAINER, HEADER } from '../components/layout'
import MetadataComponent from '../components/meta'

export default function SettingsPage() {
  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>การตั้งค่า - PM-RianArai</title>
        <meta name="description" content="เข้าเรียนทุกวิชาได้จากที่เดียว" />
        <meta property="og:url" content="https://pm-rianarai.vercel.app" />
        <meta property="og:title" content="PM Rianarai - เรียนอะไร" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>
      <LayoutComponent>
        <div className={CONTAINER}>
          <h1 className={HEADER}>การตั้งค่า</h1>
          <div className="grid grid-cols-2">
            <div className="p-4 mx-8 border rounded">
              <h2 className="text-2xl font-medium px-10 py-8">ข้อมูลส่วนตัว</h2>
              <MetadataComponent />
            </div>
            <div className="p-4 mx-8 border rounded">
              <h2 className="text-2xl font-medium px-10 py-8">ข้อมูลส่วนตัว</h2>

              <MetadataComponent />
            </div>
          </div>
        </div>
      </LayoutComponent>
    </div>
  )
}
