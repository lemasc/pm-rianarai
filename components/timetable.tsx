import { Popover, Transition } from '@headlessui/react'
import { useDocument } from '@nandorojo/swr-firestore'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../shared/authContext'
import { Meeting, useMeeting } from '../shared/meetingContext'

interface Schedule {
  [days: string]: TimeSlots[]
}

interface TimeSlots {
  start: string
  end: string
  teacher: string
  code: string
}

interface MeetingComponentProps {
  meeting: Meeting
  slot?: TimeSlots
}

type State = 'active' | 'start' | 'break' | 'end'

const MeetingJoin: React.FC<MeetingComponentProps> = ({ meeting }) => {
  const { launchMeeting } = useMeeting()
  const [copy, setCopy] = useState(false)
  const copyToCp = () => {
    navigator.clipboard.writeText(meeting.code)
    setCopy(true)
  }
  return (
    <>
      <button className="zoom-btn mx-8" onClick={() => launchMeeting(meeting)}>
        Launch Meetings
      </button>
      {!meeting.url && (
        <div className="flex flex-col p-4">
          <span className="text-sm">หากระบบร้องขอรหัสผ่าน ให้ใช้รหัสผ่านต่อไปนี้</span>
          <div className="flex flex-row justify-center align-middle p-2">
            <div className="bg-zoom-100 dark:bg-zoom-900 rounded-l-lg text-lg py-2 px-4 border font-mono">
              {meeting.code}
            </div>
            <button
              onClick={() => copyToCp()}
              className="bg-white dark:bg-black dark:hover:bg-gray-900 hover:bg-gray-100 rounded-r-lg text-sm p-2 border font-light focus:outline-none"
            >
              คัดลอก
            </button>
            <Transition
              show={copy}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opactity-100"
              leaveTo="opacity-0"
              className="text-red-500 text-xs py-4 px-2"
              role="dialog"
              aria-modal="true"
              afterEnter={() => {
                setTimeout(() => setCopy(false), 1000)
              }}
            >
              คัดลอกแล้ว
            </Transition>
          </div>
          <a href="/faq#passcode" title="รหัสผ่าน" className="text-sm underline p-2">
            ทำไมยังต้องใช้รหัสผ่าน?
          </a>
        </div>
      )}
    </>
  )
}

const MeetingInfo: React.FC<MeetingComponentProps> = ({ meeting, slot }) => {
  return (
    <>
      {meeting?.subject} : {slot.code}
    </>
  )
}

export default function TimetableComponent(): JSX.Element {
  const [date, setDate] = useState(new Date())
  const [active, setActive] = useState<TimeSlots | null>(null)
  const [state, setState] = useState<State>('active')
  const [nextActive, setNextActive] = useState<TimeSlots | null>(null)
  const [curDay, setCurday] = useState<string>('monday')
  const { metadata } = useAuth()
  const { getMeetingByName } = useMeeting()
  const [meeting, setMeeting] = useState(null)
  const { data, error } = useDocument<Schedule>(`classes/${metadata.class}`, {
    listen: true,
    onSuccess: (d) => {
      console.log(d)
    },
  })

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  useEffect(() => {
    const timerID = setInterval(() => {
      const d = new Date()
      setDate(d)
      // setCurday(days[d.getDay()])
    }, 1000)
    return () => clearInterval(timerID)
  })
  useEffect(() => {
    if (data && data[curDay]) {
      const timeString = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      const target = data[curDay]
      if (timeString < target[0].start) {
        setState('start')
        setNextActive(target[0])
        return
      }
      if (timeString > target[target.length - 1].end) {
        setState('end')
        setActive(null)
        setNextActive(null)
        return
      }
      for (let i = 0; i < target.length; i++) {
        if (timeString >= target[i].start && timeString <= target[i].end) {
          setState('active')
          setActive(target[i])
          setMeeting(getMeetingByName(target[i].teacher))
          if (target[i + 1]) setNextActive(target[i + 1])
          else setNextActive(null)
          return
        } else if (
          target[i + 1] &&
          timeString > target[i].end &&
          timeString < target[i + 1].start
        ) {
          setState('break')
          setActive(null)
          setNextActive(target[i + 1])
        }
      }
      setActive(null)
      setNextActive(null)
    }
  }, [data, date, curDay, getMeetingByName])
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
    <div className="flex flex-col justify-center items-center">
      <h4 className="text-gray-900 dark:text-gray-100 py-2">
        วันที่ {date.toLocaleDateString('th-TH')} เวลา {date.toLocaleTimeString('th-TH')} น.
      </h4>
      {active && meeting ? (
        <div className="flex flex-col md:grid md:grid-cols-2 sm:divide-x-2">
          <div className="flex flex-col justify-center">
            <div className="text-2xl p-4 text-blue-600 font-medium px-8">
              <MeetingInfo slot={active} meeting={meeting} />
            </div>
            <span className="text-blue-600">สอนโดย อ.{active.teacher}</span>
            <span className="font-light p-2">
              {active.start} น. - {active.end} น.
            </span>
          </div>
          <div className="flex flex-col justify-center">
            <MeetingJoin meeting={meeting} />
          </div>
        </div>
      ) : (
        <>
          <div className="text-2xl p-8 text-green-600 font-medium">ไม่มีคาบเรียนในตอนนี้</div>
          <span className="text-sm font-light creative-font">{message}</span>
        </>
      )}
      {nextActive && (
        <span className="mt-4 text-sm border-t w-full pt-4 font-light px-4">
          รายวิชาต่อไป - {nextActive.code} (อ.{nextActive.teacher}) : {nextActive.start} น.
        </span>
      )}
    </div>
  )
}
