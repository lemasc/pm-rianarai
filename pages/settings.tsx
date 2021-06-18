import Head from 'next/head'
import LayoutComponent, { CONTAINER, HEADER } from '../components/layout'
import MetadataComponent from '../components/meta'

export default function SettingsPage(): JSX.Element {
  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>การตั้งค่า - PM-RianArai</title>
      </Head>
      <LayoutComponent>
        <div className={CONTAINER}>
          <h1 className={HEADER}>การตั้งค่า</h1>
          <div className="grid grid-cols-2">
            <div className="p-4 mx-8 border rounded">
              <h2 className="text-2xl font-medium p-8">ข้อมูลส่วนตัว</h2>
              <MetadataComponent />
            </div>
            <div className="p-4 mx-8 border rounded">
              <h2 className="text-2xl font-medium p-8">เชื่อมต่อบัญชี</h2>
              <p className="px-8 font-light text-center">
                จัดการการเชื่อมต่อบัญชี Google/Facebook และอีเมล ได้จากทีนี่
                <br /> เร็ว ๆ นี้
              </p>
            </div>
          </div>
        </div>
      </LayoutComponent>
    </div>
  )
}
