import Head from 'next/head'
import LayoutComponent, { CONTAINER } from '@/components/layout'
import WorkComponent from '@/components/work'
import { useAuth } from '@/shared/authContext'
import { useRouter } from 'next/router'
import { useState } from 'react'
import dayjs from 'dayjs'

export default function WorkPage(): JSX.Element {
  const [fetching, setFetching] = useState<boolean | null>(null)
  const { classroom } = useAuth()
  const router = useRouter()
  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>งานที่ได้รับ : PM-RianArai</title>
      </Head>
      <LayoutComponent>
        <div className={CONTAINER + 'flex-1 sm:space-y-10 space-y-8 mb-10'}>
          <div className={'flex pt-8 flex-row items-center'}>
            <h1 className="text-3xl flex-grow">งานที่ได้รับ</h1>
            {fetching !== null && (
              <span className="text-sm sarabun-font">
                {fetching
                  ? 'กำลังอัพเดทข้อมูล...'
                  : `อัพเดทล่าสุดเมื่อ ${dayjs().format('HH:mm')} น.`}
              </span>
            )}
          </div>
          {classroom ? (
            classroom.filter((c) => c.valid).length > 0 ? (
              <WorkComponent setFetching={setFetching} />
            ) : (
              <div className="font-light flex flex-col flex-1 items-center justify-center space-y-4">
                {classroom.filter((c) => !c.valid).length > 0 ? (
                  <span className="text-red-500 font-medium">
                    {classroom.filter((c) => !c.valid).length} บัญชีที่ไม่สามารถเชื่อมต่อได้
                  </span>
                ) : (
                  <span>ยังไม่ได้เชื่อมต่อกับ Google Classroom</span>
                )}
                <button
                  onClick={() => router.push('/settings')}
                  className="btn text-white px-4 py-2 bg-apple-500 from-apple-500 to-apple-600 ring-apple-500"
                >
                  ตั้งค่าบัญชี Classroom
                </button>
              </div>
            )
          ) : (
            <div className="font-light flex flex-col flex-1 items-center justify-center space-y-4">
              กำลังโหลดข้อมูลจาก Google Clasroom...
            </div>
          )}
        </div>
      </LayoutComponent>
    </div>
  )
}
