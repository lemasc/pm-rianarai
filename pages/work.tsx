import Head from 'next/head'
import LayoutComponent, { CONTAINER } from '@/components/layout'
import WorkComponent from '@/components/work'
import { useAuth } from '@/shared/authContext'
import { useRouter } from 'next/router'

export default function WorkPage(): JSX.Element {
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
          </div>
          {classroom &&
            (classroom.length > 0 ? (
              <WorkComponent />
            ) : (
              <div className="font-light flex flex-col flex-1 items-center justify-center space-y-4">
                <span>ยังไม่ได้เชื่อมต่อกับ Google Classroom</span>
                <button
                  onClick={() => router.push('/api/classroom/authorize')}
                  className="btn text-white px-4 py-2 bg-apple-500 from-apple-500 to-apple-600 ring-apple-500"
                >
                  เชื่อมต่อกับ Classroom
                </button>
              </div>
            ))}
        </div>
      </LayoutComponent>
    </div>
  )
}
