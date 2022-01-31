import Head from 'next/head'
import LayoutComponent, { CONTAINER } from '@/components/layout'
import WorkComponent from '@/components/work'
import { useAuth } from '@/shared/authContext'
import { useRouter } from 'next/router'
import { useState } from 'react'
import dayjs from 'dayjs'
import { isDeprecated, useInsider } from '@/shared/insider'

const MainWorkComponent = ({ setFetching }: { setFetching: (fetch: boolean) => void }) => {
  const { classroom } = useAuth()
  const router = useRouter()
  return classroom ? (
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
  )
}

export const StatusText = ({ fetching }: { fetching: boolean }) => {
  return (
    fetching !== null && (
      <span className="text-sm sarabun-font">
        {fetching ? 'กำลังอัพเดทข้อมูล...' : `อัพเดทล่าสุดเมื่อ ${dayjs().format('HH:mm')} น.`}
      </span>
    )
  )
}
export default function WorkPage(): JSX.Element {
  const [fetching, setFetching] = useState<boolean | null>(null)
  const { clear } = useInsider()
  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>งานที่ได้รับ : PM-RianArai</title>
      </Head>
      <LayoutComponent>
        <div className={CONTAINER + 'flex-1 sm:space-y-10 space-y-8 mb-10'}>
          <div className={'flex pt-8 flex-row items-center'}>
            <h1 className="text-3xl flex-grow">งานที่ได้รับ</h1>
            {isDeprecated() ? (
              <span className="text-red-600 dark:text-red-400">ยุติการให้บริการแล้ว</span>
            ) : (
              <StatusText fetching={fetching} />
            )}
          </div>
          {isDeprecated() ? (
            <div className=" flex flex-1 flex-col p-6 lg:p-8 gap-8 items-center justify-center w-full bg-gray-200 dark:bg-gray-800">
              <div className="max-w-3xl text-gray-800 dark:text-gray-300 sarabun-font flex flex-col items-center justify-center text-center gap-6">
                <h3 className="text-2xl font-medium kanit-font dark:text-white py-2">
                  PM-RianArai ยุติการให้บริการฟีเจอร์ <u>งานที่ได้รับ</u> แล้ว
                </h3>
                <p>
                  สืบเนื่องจากการอัพเดทแอพพลิเคชั่น RianArai 3.0 ซึ่งประกอบด้วยการแสดงงานต่าง ๆ
                  ที่จัดการได้ง่ายขึ้น รวมไปถึงการปรับปรุงประสิทธิภาพและฟีเจอร์ใหม่ ๆ เพิ่มเติม
                </p>
                <p>
                  เราจึงขอแนะนำให้ท่านดาวน์โหลดและติดตั้งแอพพลิเคชั่น RianArai
                  เพื่อประสบการณ์การใช้งานที่ดีขึ้นสำหรับท่าน
                </p>
                <p>ขอบคุณสำหรับผู้ใช้งานทุก ๆ ท่านที่ยังใช้บริการ PM-RianArai เรื่อยมา</p>
              </div>
              <div className="flex flex-col gap-4 text-sm">
                <a
                  href="https://rianarai.netlify.app/insider?utm_source=pm-rianarai&utm_medium=work_page&utm_campaign=download_v3"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-center w-full text-white px-6 py-3 rounded-lg disabled:cursor-not-allowed hover:bg-gray-600 bg-black focus:outline-none focus:ring-2 ring-gray-600 focus:ring-offset-4 ring-offset-gray-200 dark:ring-offset-gray-800"
                >
                  ดาวน์โหลดและติดตั้งแอพพลิเคชั่น RianArai
                </a>
                <button
                  onClick={() => {
                    clear()
                  }}
                  className="text-center w-full text-black px-6 py-3 rounded-lg disabled:cursor-not-allowed hover:bg-gray-300 bg-white focus:outline-none focus:ring-2 ring-gray-300 focus:ring-offset-4 ring-offset-gray-200 dark:ring-offset-gray-800"
                >
                  อ่านประกาศฉบับเต็มเกี่ยวกับ RianArai 3.0
                </button>
              </div>
            </div>
          ) : (
            <MainWorkComponent setFetching={setFetching} />
          )}
        </div>
      </LayoutComponent>
    </div>
  )
}
