import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ClockIcon, BookOpenIcon } from '@heroicons/react/outline'
import { useMeeting } from '@/shared/meetingContext'
import { useAuth } from '@/shared/authContext'
import TimeSlotsComponent from '@/components/timeslots'
import { CONTAINER, HEADER } from '@/components/layout'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import useClasswork, { mergeFirestore, timeList } from '@/shared/classwork'
import { useCollection } from 'swr-firestore-v9'
import { ClassroomCourseWorkResult } from '@/types/classroom'
import { StatusButton } from './work/status'
import { checkDuedate, checkTurnedIn } from './work/item'

const WhatsNewComponent = dynamic(() => import('@/components/whatsnew'))
const AnnouncementComponent = dynamic(() => import('@/components/announce'))

export default function Dashboard(): JSX.Element {
  const { metadata, user, classroom, version } = useAuth()
  const { date, schedule, curDay } = useMeeting()
  const [showAnnounce, setAnnounce] = useState(false)
  const [classWork, setClassWork] = useState<ClassroomCourseWorkResult[] | null>(null)
  const { classWork: work } = useClasswork()
  const { data: firestoreData } = useCollection<ClassroomCourseWorkResult>(
    user ? `users/${user.uid}/classwork` : null,
    {
      where: [
        ['dueDate', '>=', timeList[0].startTime],
        ['dueDate', '<=', timeList[0].endTime],
      ],
      listen: true,
    }
  )
  useEffect(() => {
    let _isMounted = true
    if (!_isMounted) return
    if (!work) return
    setClassWork(
      mergeFirestore([
        work.filter((d) => d.dueDate >= timeList[0].startTime && d.dueDate <= timeList[0].endTime),
        firestoreData ? firestoreData : [],
      ])
    )
    return () => {
      _isMounted = false
    }
  }, [work, firestoreData])

  function getData(status: StatusButton['status']): ClassroomCourseWorkResult[] {
    if (!classWork) return []
    const d = classWork.filter((c) => {
      if (c.tags && c.tags.includes('archived')) return false
      switch (status) {
        case 'turned-in':
          return checkTurnedIn(c.state)
        case 'not-turned-in':
          return !checkTurnedIn(c.state) && !checkDuedate(c.dueDate)
        case 'missing':
          return !checkTurnedIn(c.state) && checkDuedate(c.dueDate)
      }
    })
    return d
  }
  const percentage = classWork ? getData('turned-in').length / classWork.length : 0
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
        <div className="flex md:flex-row flex-col md:gap-8">
          <div className="flex flex-1 flex-col flex-grow md:gap-8 gap-6">
            <div className="flex flex-grow shadow-md rounded bg-gray-100 dark:bg-gray-800 sm:px-4 py-4">
              <TimeSlotsComponent />
            </div>
            <div className="md:pb-10 gap-10 pb-6">
              <div className="relative items-center justify-center flex flex-row border p-6 sm:p-8 rounded-b-lg font-light text-gray-800 dark:text-gray-100 dark:bg-gray-800">
                <div className="items-center justify-center flex md:flex-row flex-col gap-4">
                  <div className="h-24 w-24 md:w-30 md:h-30 flex flex-shrink-0">
                    <CircularProgressbar
                      value={percentage}
                      maxValue={1}
                      text={isNaN(percentage) ? 'กำลังโหลด...' : Math.floor(percentage * 100) + '%'}
                      circleRatio={0.75}
                      strokeWidth={9}
                      styles={buildStyles({
                        rotation: 1 / 2 + 1 / 8,
                        pathTransitionDuration: 0.5,
                        pathColor: `rgba(62, 199, 70, ${percentage})`,
                        textColor: '#848484',
                        textSize: isNaN(percentage) ? '14px' : '20px',
                        backgroundColor: '#3e98c7',
                      })}
                    />
                  </div>
                  <div className="flex lg:flex-row flex-col md:gap-6 gap-4 items-center">
                    <div className="flex flex-col flex-grow items-center">
                      <span className="font-medium text-lg text-center">
                        งานทั้งหมดในสัปดาห์นี้
                      </span>
                      <div className="flex sm:flex-row flex-col px-2 sarabun-font sm:space-x-3 space-y-1 sm:flex-wrap sm:items-center justify-center">
                        <div className="text-blue-600">
                          <span className="font-bold text-4xl px-2">
                            {getData('not-turned-in').length}
                          </span>{' '}
                          งานที่ยังไม่ได้ส่ง
                        </div>
                        <div className="text-apple-600">
                          <span className="font-bold text-4xl px-2">
                            {getData('turned-in').length}
                          </span>{' '}
                          งานที่ส่งแล้ว
                        </div>
                        <div className="text-red-500">
                          <span className="font-bold text-4xl px-2">
                            {getData('missing').length}
                          </span>{' '}
                          ขาดส่ง
                        </div>
                      </div>
                    </div>

                    <Link href="/work">
                      <a className="flex flex-shrink-0 text-center font-normal bg-yellow-500 hover:bg-gradient-to-b from-yellow-500 to-yellow-600 text-white sm:px-6 sm:py-3 px-4 py-2 rounded">
                        ดูเพิ่มเติม
                      </a>
                    </Link>
                  </div>
                </div>
                {classroom && classroom.length === 0 && (
                  <div className="bg-gray-400 bg-opacity-90 text-white absolute inset-0 h-full w-full flex flex-col items-center justify-center">
                    เชื่อมต่อกับ Google Classroom เพื่อตรวจสอบงานได้จากที่เดียว
                    <Link href="/work">
                      <a className="p-2 font-normal text-right text-gray-100 hover:text-gray-200 underline">
                        ดูเพิ่มเติม
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:w-72 w-full gap-8 flex flex-col">
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
          </div>
        </div>
      </div>
      <AnnouncementComponent show={showAnnounce} onClose={() => setAnnounce(false)} />
      {!(metadata.upgrade && metadata.upgrade == version) && <WhatsNewComponent />}
    </>
  )
}
