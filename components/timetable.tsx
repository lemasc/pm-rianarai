import { Transition } from '@headlessui/react'
import { useDocument } from '@nandorojo/swr-firestore'
import React, { ReactNodeArray, useEffect, useState } from 'react'
import { useAuth } from '../shared/authContext'
import { Meeting, useMeeting } from '../shared/meetingContext'
import { DocumentDuplicateIcon, ClipboardCheckIcon } from '@heroicons/react/outline'
import Tippy from '@tippyjs/react'
import Link from 'next/link'
import LogRocket from 'logrocket'

interface Schedule {
  [days: string]: TimeSlots[]
}

interface TimeSlots {
  start: string
  end: string
  teacher: string[]
  code: string[]
}

interface TimeSlotsMemory {
  active: TimeSlots | null
  next: TimeSlots | null
}

interface MeetingComponentProps {
  meetings: Meeting[]
  slot?: TimeSlots
  showNames: boolean
}

type State = 'active' | 'start' | 'break' | 'end' | ''

function MeetingNotFound(): JSX.Element {
  return (
    <>
      <h4 className="text-lg font-medium text-red-500 p-4">ไม่พบข้อมูลผู้สอนในรายวิชานี้</h4>
      <div className="text-sm">
        นี่อาจเกิดจาก
        <br />
        <ul className="py-2 font-light block">
          <li className="px-16">รายวิชานี้ไม่ได้เรียนในระบบ Zoom</li>
          <li className="px-16">ยังไม่มีข้อมูลผู้สอนของรายวิชานี้</li>
          <li className="px-16">พิมพ์ตกหล่นทำให้ระบบหาข้อมูลไม่เจอ</li>
        </ul>
        หากคิดว่านี้เป็นข้อผิดพลาด กรุณา{' '}
        <Link href="/support">
          <a
            target="_blank"
            rel="noopener noreferrer"
            title="Support"
            className="font-normal underline text-blue-500 hover:text-blue-600"
          >
            แจ้งปัญหาการใช้งาน
          </a>
        </Link>
      </div>
    </>
  )
}

const MeetingJoin: React.FC<MeetingComponentProps> = ({ showNames, meetings }) => {
  const { launchMeeting } = useMeeting()
  const [copy, setCopy] = useState(-1)
  const copyToCp = (code: string, index: number): void => {
    navigator.clipboard.writeText(code)
    setCopy(index)
  }
  const buttons: ReactNodeArray = []
  const passcode: ReactNodeArray = []
  let noUrls = false
  meetings.map((meeting, index) => {
    buttons.push(
      <button
        title={'เข้าสู่ห้องเรียน จำเป็นต้องมี Zoom ติดตั้งลงในอุปกรณ์แล้ว'}
        key={index}
        className="zoom-btn mx-8"
        onClick={() => launchMeeting(meeting)}
      >
        Launch Meetings {showNames && ' : ' + meeting.name}
      </button>
    )
    if (meeting.url) {
      passcode.push(null)
      return
    }
    noUrls = true
    passcode.push(
      <div key={index} className="flex flex-row justify-center align-middle">
        {showNames && <div className="pt-4 px-4 text-sm">{meeting.name} :</div>}
        <div className="bg-zoom-100 dark:bg-zoom-900 rounded-l-lg text-lg py-2 px-4 border font-mono">
          {meeting.code}
        </div>
        <Tippy
          visible={copy === index}
          content="คัดลอกแล้ว"
          placement="bottom"
          onShown={() => setTimeout(() => setCopy(-1), 3000)}
        >
          <button
            title="คัดลอกรหัส"
            onClick={() => copyToCp(meeting.code, index)}
            className={
              (copy === index ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-100') +
              ' px-4 dark:bg-black dark:hover:bg-gray-900  rounded-r-lg text-sm p-2 border font-light focus:outline-none'
            }
          >
            {copy === index ? (
              <ClipboardCheckIcon className="h-5 w-5" />
            ) : (
              <DocumentDuplicateIcon className="h-5 w-5" />
            )}
          </button>
        </Tippy>
      </div>
    )
  })
  return (
    <>
      {buttons}
      {noUrls && (
        <div className="flex flex-col pt-4 mt-4 px-4 border-t border-gray-400">
          <span className="text-sm py-1">หากระบบร้องขอรหัสผ่าน ให้ใช้รหัสผ่านต่อไปนี้</span>
          <div className="flex flex-col space-y-1">{passcode}</div>
          <a
            href="/about?search=รหัสผ่าน#jump"
            target="_blank"
            title="รหัสผ่าน"
            rel="noopener noreferrer"
            className="text-sm underline p-2 text-blue-500 hover:text-blue-600"
          >
            ทำไมยังต้องใช้รหัสผ่าน?
          </a>
        </div>
      )}
    </>
  )
}

function GenerateTeacherName(teacher: string[]): ReactNodeArray {
  function getPrefix(t: string): string {
    if (t.match(/^[a-zA-Z0-9]*$/g)) return 'T.'
    if (t.indexOf('.') === -1) return 'อ.'
    return ''
  }
  return teacher.map((t, i) => (
    <span key={i}>
      {i !== 0 && ' | '}
      {getPrefix(t)}
      {t}
    </span>
  ))
}

export default function TimetableComponent(): JSX.Element {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const { metadata } = useAuth()
  const { getMeetingByName } = useMeeting()

  const [date, setDate] = useState(new Date())
  const [memory, _setMemory] = useState<TimeSlotsMemory>({ active: null, next: null })
  const [memoryQueue, setQueue] = useState<TimeSlotsMemory>(null)
  const [show, setShow] = useState(true)
  const [state, setState] = useState<State>('')
  const [curDay, setCurday] = useState<string>('sunday')
  const [meeting, setMeeting] = useState<Meeting[]>([])
  const { data } = useDocument<Schedule>(metadata ? `classes/${metadata.class}` : null, {
    listen: true,
  })

  useEffect(() => {
    const timerID = setInterval(() => {
      const d = new Date()
      setDate(d)
      setCurday(days[d.getDay()])
    }, 1000)
    return () => clearInterval(timerID)
  })

  function zeroPad(num, places): string {
    const zero = places - num.toString().length + 1
    return Array(+(zero > 0 && zero)).join('0') + num
  }

  useEffect(() => {
    function getActualStartTime(t: TimeSlots): string {
      return t.start.slice(0, 2) + ':' + zeroPad(parseInt(t.start.slice(3)) - 5, 2)
    }

    const inTimeRange = (time: string, slot: TimeSlots): boolean => {
      return time >= getActualStartTime(slot) && time <= slot.end
    }
    const setMemory = (state: TimeSlotsMemory): void => {
      // Compare the previous state and the current state
      if ((state.active === memory.active && state.next === memory.next) || memoryQueue !== null)
        return
      setQueue(state)
      LogRocket.log('Set Memory', state)
      setShow(false)
    }
    let _isMounted = true
    if (!_isMounted) return
    if (data && data[curDay]) {
      //const timeString = '12:11'
      const timeString = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      const target = data[curDay]
      // If the time is still in range, don't check anything.
      if (memory.active !== null && inTimeRange(timeString, memory.active)) return
      // Out of range, start recheck
      if (timeString < getActualStartTime(target[0])) {
        setState('start')
        setMemory({ active: null, next: target[0] })
        return
      }
      if (timeString > target[target.length - 1].end) {
        setState('end')
        setMemory({ active: null, next: null })
        return
      }
      for (let i = 0; i < target.length; i++) {
        if (inTimeRange(timeString, target[i])) {
          setState('active')
          setMemory({ active: target[i], next: target[i + 1] ? target[i + 1] : null })
          if (target[i].teacher.length === 0) {
            setMeeting([null])
          } else {
            let mList = []
            target[i].teacher.map((t) => {
              mList = [...mList, ...getMeetingByName(t)]
            })
            setMeeting(mList)
          }
          return
        } else if (
          target[i + 1] &&
          timeString > target[i].end &&
          timeString < getActualStartTime(target[i + 1])
        ) {
          setState('break')
          setMemory({ active: null, next: target[i + 1] })
          return
        }
      }
    }
    setMemory({ active: null, next: null })
    return () => {
      _isMounted = false
    }
  }, [curDay, data, date, getMeetingByName, memory, memoryQueue])
  let message = ''
  switch (state) {
    case 'start':
      message = 'ทำสมาธิ หายใจเข้าลึก ๆ'
      break
    case 'break':
      message = 'พักผ่อนให้เรียบร้อย เตรียมตัวเรียนต่อนะ'
      break
    case 'end':
      message = 'หมดวันแล้ว วันนี้เก่งมาก!'
      break
  }
  return (
    <Transition
      show={show}
      appear={true}
      className="flex flex-col justify-center items-center"
      enter="transition-opacity duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      beforeEnter={() => {
        if (memoryQueue) {
          _setMemory(memoryQueue)
          setQueue(null)
        }
      }}
      afterLeave={() => setShow(true)}
    >
      <h4 className="text-gray-900 dark:text-gray-100 py-2 creative-font">
        สวัสดี {metadata?.displayName}
      </h4>
      {state == '' && (
        <div className="flex flex-col px-4">
          <h3 className="text-2xl p-4 text-blue-600 font-medium px-8">กำลังโหลด...</h3>
        </div>
      )}
      {memory.active && state != '' && (
        <div className="flex flex-col sm:grid sm:grid-cols-2 w-full sm:divide-x divide-gray-400">
          <div className="flex flex-col justify-center">
            <div className="text-2xl p-4 text-blue-600 font-medium px-8">
              {meeting[0] !== null && meeting[0].subject + ' : '}
              {memory.active.code.length > 1 && <br />}
              {memory.active.code.join(' , ')}
            </div>
            {memory.active.teacher.length > 0 && (
              <span className="px-4 text-blue-600">
                สอนโดย {GenerateTeacherName(memory.active.teacher)}
              </span>
            )}
            <span className="font-light p-2">
              {memory.active.start} น. - {memory.active.end} น.
            </span>
          </div>
          <div className="flex flex-col justify-center">
            {meeting[0] === null || meeting[0].meet ? (
              <MeetingNotFound />
            ) : (
              <MeetingJoin meetings={meeting} showNames={meeting.length != 1} />
            )}
          </div>
        </div>
      )}
      {memory && !memory.active && state != '' && (
        <>
          <div className="text-2xl p-8 text-green-600 font-medium">ไม่มีคาบเรียนในตอนนี้</div>
          <span className="text-sm font-light creative-font px-4 py-1">{message}</span>
        </>
      )}
      {memory.next && state != '' && (
        <span className="mt-4 text-sm border-t-2 border-gray-500 w-full pt-4 font-light px-4">
          รายวิชาต่อไป - {memory.next.code.join(' , ')} ({GenerateTeacherName(memory.next.teacher)})
          : {memory.next.start} น.
        </span>
      )}
    </Transition>
  )
}
