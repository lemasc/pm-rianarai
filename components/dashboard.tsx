import Link from 'next/link'
import { ClockIcon, BookOpenIcon } from '@heroicons/react/outline'
import { useMeeting } from '@/shared/meetingContext'
import { useAuth } from '@/shared/authContext'
import TimeSlotsComponent from '@/components/timeslots'
import { CONTAINER, HEADER } from '@/components/layout'
import WorkWidget from './work/widget'
import Image from 'next/image'
import { isDeprecated } from '@/shared/insider'

export default function Dashboard(): JSX.Element {
  const { metadata } = useAuth()
  const { date, schedule, curDay } = useMeeting()

  return (
    <>
      <div className={CONTAINER + 'space-y-8 mb-20 md:mb-0'}>
        <div className={'flex ' + HEADER}>
          <h2 className="flex-grow">สวัสดี {metadata.displayName}</h2>
          <span className="text-2xl md:flex hidden items-center creative-font text-gray-500 select-none">
            <ClockIcon className="mr-2 h-8 w-8" />
            <span className="w-20">{date.toLocaleTimeString('th-TH')}</span>
          </span>
        </div>
        <div className="flex md:flex-row flex-col gap-8 md:items-start">
          <div className="flex flex-1 flex-col-reverse md:flex-col flex-grow md:gap-8 gap-6">
            <div className="flex flex-grow shadow-md rounded bg-gray-100 dark:bg-gray-800 sm:px-4 py-4">
              <TimeSlotsComponent />
            </div>
            <div className="rounded-lg bg-black text-white flex flex-col lg:flex-row gap-6 items-center justify-center px-8 py-10">
              <div className="flex flex-col gap-2 items-center justify-center ">
                <div className="flex flex-row gap-4 items-center">
                  <Image src="/logo_white.svg" width={45} height={45} />
                  <span className="header-font text-2xl">เรียนอะไร</span>
                </div>
                <span>Insider Release</span>
              </div>
              <div className="flex flex-col gap-4">
                <span className="sarabun-font text-center max-w-md">
                  RianArai 3.0 พร้อมใช้งานใน Windows, Android, และ iOS แล้ว
                  อัพเดททันทีเพื่อรับประสบการณ์การเรียนที่ดีกว่า
                </span>
                <a
                  href="https://rianarai.netlify.app/insider?utm_source=pm-rianarai&utm_medium=home_banner&utm_campaign=join_insider"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-center text-black w-full px-4 py-2 rounded-lg disabled:cursor-not-allowed hover:bg-gray-200 bg-white focus:outline-none focus:ring-2 ring-gray-200 focus:ring-offset-4 ring-offset-black"
                >
                  ดาวน์โหลด RianArai 3.0
                </a>
              </div>
            </div>
          </div>
          <div className="md:w-72 w-full gap-8 flex flex-col">
            {!isDeprecated() && <WorkWidget />}
            <Link href="/timetable">
              <a
                title="ตารางสอน"
                className="mb-10 items-center flex flex-row shadow-md rounded bg-apple-500 hover:bg-gradient-to-b from-apple-500 to-apple-600 text-white p-6"
              >
                <div className="flex flex-col flex-grow items-start">
                  <h4 className="py-2 text-2xl font-medium">ตารางสอน</h4>
                  <span className="py-2 text-sm sarabun-font">
                    {schedule && schedule[curDay] && schedule[curDay].length
                      ? schedule[curDay].length
                      : 0}{' '}
                    รายวิชาที่ต้องเรียนวันนี้
                  </span>
                </div>
                <BookOpenIcon className="md:h-12 md:w-12 w-10 h-10" />
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
