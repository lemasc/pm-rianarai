import { useState } from 'react'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  AcademicCapIcon,
  ClockIcon,
  SpeakerphoneIcon,
  BookOpenIcon,
  IdentificationIcon,
} from '@heroicons/react/outline'

import { db } from '@/shared/db'
import { useMeeting } from '@/shared/meetingContext'
import { useAuth } from '@/shared/authContext'
import TimeSlotsComponent from '@/components/timeslots'
import { CONTAINER, HEADER } from '@/components/layout'
import { getUnreadAnnounce } from '@/components/layout/menubar'
import { time } from '@/pages/work'
import WelcomeComponent from '@/components/welcome'
import AnnouncementComponent from '@/components/announce'

export default function Dashboard(): JSX.Element {
  const { metadata, announce, classroom } = useAuth()
  const { date, schedule, curDay } = useMeeting()
  const [showAnnounce, setAnnounce] = useState(false)
  const work = useLiveQuery(() =>
    db.courseWork.where('dueDate').between(time[0].startTime, time[0].endTime).count()
  )
  return (
    <>
      <div className={CONTAINER + 'sm:space-y-10 space-y-8'}>
        <div className={'flex ' + HEADER}>
          <h2 className="flex-grow">สวัสดี {metadata.displayName}</h2>
          <span className="text-2xl md:flex hidden items-center creative-font text-gray-500 select-none">
            <ClockIcon className="mr-2 h-8 w-8" />
            <span className="w-20">{date.toLocaleTimeString('th-TH')}</span>
          </span>
        </div>
        <div className="flex md:flex-row flex-col md:gap-8">
          <div className="flex flex-1 flex-col flex-grow md:gap-8 gap-6">
            <div className="flex flex-grow shadow-md rounded bg-gray-100 dark:bg-gray-800 p-4">
              <TimeSlotsComponent />
            </div>
            <div className="grid md:grid-cols-2 md:pb-10 gap-10 pb-6">
              <Link href="/timetable">
                <a
                  title="ตารางสอน"
                  className="items-center flex flex-row shadow-md rounded bg-apple-500 hover:bg-gradient-to-b from-apple-500 to-apple-600 text-white p-6"
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
              <div className="flex items-center flex-row shadow-md rounded bg-blue-500 hover:bg-gradient-to-b from-blue-500 to-blue-600 text-white p-6">
                <button
                  onClick={() => setAnnounce(true)}
                  className="focus:outline-none flex flex-col flex-grow items-start"
                >
                  <h4 className="py-2 text-2xl font-medium">ประกาศ</h4>
                  <span className="py-2 text-sm sarabun-font">
                    {getUnreadAnnounce(announce, metadata).length} ประกาศที่ยังไม่ได้อ่าน
                  </span>
                </button>
                <SpeakerphoneIcon className="md:h-12 md:w-12 w-10 h-10" />
              </div>
            </div>
          </div>
          <div className="md:w-72 w-full gap-8 flex flex-col">
            <Link href="/chumnum">
              <a
                title="ชุมนุม"
                className="items-center flex flex-row shadow-md rounded bg-purple-500 hover:bg-gradient-to-b from-purple-500 to-purple-600 text-white p-6"
              >
                <div className="flex flex-col flex-grow items-start">
                  <h4 className="py-2 text-2xl font-medium">ลงทะเบียนชุมนุม</h4>
                  <span className="py-2 text-sm sarabun-font">ตรวจสอบข้อมูลการลงทะเบียน</span>
                </div>
                <IdentificationIcon className="md:h-12 md:w-12 w-10 h-10" />
              </a>
            </Link>
            <div>
              <div className="items-center flex flex-row rounded-t-lg hover:bg-yellow-500 bg-gradient-to-b from-yellow-400 to-yellow-500 text-white py-3 px-6">
                <h4 className="py-2 text-lg font-medium flex-grow">งานที่ได้รับ</h4>
                <AcademicCapIcon className="w-10 h-10" />
              </div>
              <div className="relative flex flex-col border p-4 rounded-b-lg font-light text-gray-800 dark:text-gray-100 dark:bg-gray-800">
                {classroom
                  ? classroom.length === 0
                    ? 'ยังไม่ได้เชื่อมต่อกับ Google Classroom'
                    : work + ' งานทั้งหมดในสัปดาห์นี้'
                  : 'กำลังโหลด...'}
                <Link href="/work">
                  <a className="p-2 font-normal text-right sticky bottom-0 text-yellow-500 hover:text-yellow-600 underline">
                    ดูเพิ่มเติม
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnnouncementComponent show={showAnnounce} onClose={() => setAnnounce(false)} />
      {!metadata.upgrade && <WelcomeComponent />}
    </>
  )
}
