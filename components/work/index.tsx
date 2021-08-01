import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Loader from 'react-loader-spinner'
import Fuse from 'fuse.js'
import { Scrollbars } from 'react-custom-scrollbars-2'
import { useCollection } from 'swr-firestore-v9'
import { Transition } from '@headlessui/react'
import { useWindowWidth } from '@react-hook/window-size/throttled'

import { db } from '@/shared/db'
import { useAuth } from '@/shared/authContext'
import useClasswork, { mergeFirestore, timeList, TimeRange } from '@/shared/classwork'
import { SelectData } from '@/components/layout/select'
import type { ClassroomCourseWorkResult } from '@/types/classroom'

import Toolbar from './toolbar'
import ClassworkItem, { checkTurnedIn, checkDuedate } from './item'
import StatusSelector, { Selector, buttons, StatusButton } from './status'
import { WorkModalState } from './modal'

const WorkModal = dynamic(() => import('./modal'))

const desc: Record<Selector, JSX.Element> = {
  '': (
    <>
      ไม่พบงานที่ต้องการ? เพิ่มงานได้ด้วยตนเองที่ปุ่ม <b className="font-medium">เพิ่มงานใหม่</b>{' '}
      จากเมนูด้านซ้ายมือ
    </>
  ),
  archived: (
    <>
      คัดแยกงานออกจากรายการอื่น ๆ โดยทำสัญลักษณ์ <b className="font-medium">ที่จัดเก็บ</b>
    </>
  ),
  important: (
    <>
      ทำสัญลักษณ์ <b className="font-medium">สิ่งสำคัญ</b> เพื่อให้คุณโฟกัสกับงานที่จะทำได้ทันที
    </>
  ),
  missing: (
    <>
      งานทั้งหมดที่<b className="font-medium">ยังไม่ได้ส่งและเลยกำหนดแล้ว</b>จะปรากฏขึ้นทีนี่
    </>
  ),
  'not-turned-in': (
    <>
      งานทั้งหมดที่<b className="font-medium">ยังไม่ได้ส่งและไม่เลยกำหนด</b>จะปรากฏขึ้นทีนี่
    </>
  ),
  'turned-in': (
    <>
      งานทั้งหมดที่<b className="font-medium">ส่งแล้ว</b>จะปรากฏขึ้นทีนี่
    </>
  ),
}

export default function WorkComponent({
  setFetching,
}: {
  setFetching: (fetch: boolean) => void
}): JSX.Element {
  const { classWork: _classWork, fetching } = useClasswork()
  const { user } = useAuth()
  const [lastIndex, setLastIndex] = useState(-1)
  const [modal, setModal] = useState<WorkModalState>({ show: false })
  const [time, setTime] = useState<SelectData<TimeRange>>(timeList[0])
  const [search, setSearch] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [noDueDate, allowNoDueDate] = useState(false)
  const [classWork, setClassWork] = useState<ClassroomCourseWorkResult[]>([])
  const [button, setButton] = useState<StatusButton>(buttons[0])
  const { data: _customData } = useCollection<ClassroomCourseWorkResult>(
    user ? `users/${user.uid}/classwork` : null,
    {
      listen: true,
    }
  )
  const width = useWindowWidth({ initialWidth: 1360 })

  useEffect(() => {
    if (!_classWork) return
    function filterTime(d: ClassroomCourseWorkResult): boolean {
      {
        if (!d.dueDate) return noDueDate
        return d.dueDate >= time.startTime && d.dueDate <= time.endTime
      }
    }
    ;(async () => {
      const courses = await db.courses.toArray()
      const data = _classWork.filter(filterTime)
      setClassWork(
        mergeFirestore([data, _customData ? _customData.filter(filterTime) : []])
          .map((d) => {
            if (!d.courseId) return d
            const course = courses.filter((c) => c.id === d.courseId)
            if (course.length === 0) return d
            return {
              ...d,
              course: course[0],
            }
          })
          .sort((prev, next) => (prev.dueDate ? (prev.dueDate > next.dueDate ? 1 : -1) : 0))
          .reverse()
      )
    })()
  }, [_classWork, noDueDate, _customData, time])

  useEffect(() => {
    setFetching(fetching)
  }, [setFetching, fetching])

  function filterWork(c: ClassroomCourseWorkResult, i: number): boolean {
    if (modal.index !== undefined && i === lastIndex) return true
    const isArchived = c.tags && c.tags.includes('archived')
    const isTurnedIn = checkTurnedIn(c.state)
    if (button.status === '') return !isArchived
    switch (button.status) {
      case 'important':
        return c.tags && c.tags.includes('important')
      case 'turned-in':
        return isTurnedIn && !isArchived
      case 'archived':
        return isArchived
      default:
        return (
          !isArchived &&
          !isTurnedIn &&
          (button.status === 'not-turned-in' ? !checkDuedate(c.dueDate) : checkDuedate(c.dueDate))
        )
    }
  }
  function withSearch(data: ClassroomCourseWorkResult[]): ClassroomCourseWorkResult[] {
    if (search == '') return data
    return new Fuse(data, { threshold: 0.2, keys: ['title', 'description', 'course.name'] })
      .search(search.trim())
      .map((d) => d.item)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredWork = classWork ? withSearch(classWork.filter(filterWork)) : []
  useEffect(() => {
    if (modal.show && modal.index != undefined) {
      setLastIndex(classWork.findIndex((c) => c.id === filteredWork[modal.index].id))
    } else {
      setLastIndex(-1)
    }
  }, [classWork, filteredWork, modal])
  return (
    <div className="border-2 rounded flex flex-1 relative">
      {_classWork && (
        <>
          <WorkModal
            state={modal}
            data={filteredWork}
            onClose={() => setModal((m) => ({ ...m, show: false }))}
          />

          {_classWork.length > 0 ? (
            <>
              <Transition
                show={(showMenu && width <= 900) || width > 900}
                enter="transition transform-gpu duration-500"
                enterFrom="opacity-0 -translate-x-10"
                enterTo="opactity-100"
                leave="transition transform-gpu duration-500"
                leaveFrom="opactity-100"
                leaveTo="opacity-0 -translate-x-10"
                className={`flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800 ${
                  width > 900 ? 'flex-shrink-0 border-r' : 'z-10 flex-grow w-full absolute inset-0'
                }`}
                afterLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => setModal({ show: true })}
                  className="mt-6 mx-6 px-16 py-2 bg-blue-500 rounded-lg text-white"
                >
                  เพิ่มงานใหม่
                </button>
                <div className="flex flex-row items-center justify-center">
                  <input
                    name="noDueDate"
                    type="checkbox"
                    checked={noDueDate}
                    onChange={(e) => allowNoDueDate(e.target.checked)}
                  />
                  <label htmlFor="noDueDate" className="px-2 mt-0.5 text-sm font-light select-none">
                    แสดงงานที่ไม่มีกำหนดส่ง
                  </label>
                </div>
                <div className="flex flex-col w-full items-start py-2">
                  <StatusSelector
                    selected={button}
                    onChange={(btn) => {
                      setShowMenu(false)
                      setButton(btn)
                    }}
                  />
                </div>
              </Transition>
              <div className={`flex-grow flex flex-col flex-1`}>
                <Toolbar
                  onMenu={() => setShowMenu(!showMenu)}
                  onSearch={setSearch}
                  setTime={setTime}
                  time={time}
                />

                {filteredWork.length > 0 ? (
                  <Scrollbars>
                    {filteredWork.map((d, i) => (
                      <ClassworkItem
                        onClick={() => setModal({ show: true, index: i })}
                        key={d.id}
                        data={d}
                      />
                    ))}
                  </Scrollbars>
                ) : (
                  <div className="flex flex-col gap-2 h-full w-full items-center justify-center text-gray-500 dark:text-gray-300 dark:bg-gray-700">
                    <button.icon className="h-16 w-16 opacity-90" />
                    <span className="font-bold text-xl sarabun-font">ไม่พบรายการ</span>
                    <span className="font-light text-sm mx-8 text-center">
                      {desc[button.status]}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 w-full flex-grow">
              <Loader type="TailSpin" color="#2DBE57" height={80} width={80} />
              <span>กำลังโหลดข้อมูลครั้งแรก อาจใช้เวลา 1-2 นาที</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
