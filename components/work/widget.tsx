import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { useCollection } from 'swr-firestore-v9'
import { useAuth } from '@/shared/authContext'
import useClasswork, { mergeFirestore, timeList } from '@/shared/classwork'
import { ClassroomCourseWorkResult } from '@/types/classroom'
import { StatusButton } from './status'
import { checkDuedate, checkTurnedIn } from './item'

export default function WorkWidget() {
  const { user, classroom } = useAuth()
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
  const percentage =
    classWork && classWork.length > 0 ? getData('turned-in').length / classWork.length : 0

  return (
    <div className="relative items-center justify-center flex flex-row border p-6 sm:p-8 rounded-b-lg font-light text-gray-800 dark:text-gray-100 dark:bg-gray-800">
      <div className="items-center justify-center flex flex-col gap-4">
        <div className="h-24 w-24 flex flex-shrink-0">
          <CircularProgressbar
            value={percentage}
            maxValue={1}
            text={isNaN(percentage) ? 'กำลังโหลด...' : Math.floor(percentage * 100) + '%'}
            circleRatio={0.75}
            strokeWidth={9}
            styles={buildStyles({
              rotation: 1 / 2 + 1 / 8,
              pathTransitionDuration: 0.5,
              pathColor: `rgb(62, 199, 70)`,
              textColor: '#848484',
              textSize: isNaN(percentage) ? '14px' : '20px',
              backgroundColor: '#3e98c7',
            })}
          />
        </div>
        <div className="flex flex-col md:gap-6 gap-4 items-center">
          <div className="flex flex-col flex-grow items-center">
            <span className="font-medium text-lg text-center">งานทั้งหมดในสัปดาห์นี้</span>
            <div className="flex flex-col px-2 sarabun-font space-y-1 justify-center">
              <div className="text-blue-600">
                <span className="font-bold text-4xl px-2">{getData('not-turned-in').length}</span>{' '}
                งานที่ยังไม่ได้ส่ง
              </div>
              <div className="text-apple-600">
                <span className="font-bold text-4xl px-2">{getData('turned-in').length}</span>{' '}
                งานที่ส่งแล้ว
              </div>
              <div className="text-red-500">
                <span className="font-bold text-4xl px-2">{getData('missing').length}</span> ขาดส่ง
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
  )
}
