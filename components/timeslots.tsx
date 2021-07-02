import { ReactNodeArray, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Meeting, useMeeting, TimeSlots } from '../shared/meetingContext'
import PaginationComponent from './pagination'

interface TimeSlotsMemory {
  active: TimeSlots | null
  next: TimeSlots | null
}

interface MemoryQueue {
  slots: TimeSlotsMemory
  state: State
}

interface MeetingComponentProps {
  meetings: Meeting[]
  showNames: boolean
  disabled: boolean
}

interface MeetingMetaProps {
  slot: TimeSlots
  disabled: boolean
}

type State = 'active' | 'start' | 'break' | 'end' | ''

function MeetingNotFound(): JSX.Element {
  return (
    <>
      <h4 className="text-lg font-medium text-red-500 p-4">ไม่พบข้อมูลผู้สอนในรายวิชานี้</h4>
      <div className="text-sm">
        นี่อาจเกิดจาก
        <br />
        <ul className="py-2 px-4 font-light">
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

const MeetingJoin: React.FC<MeetingComponentProps> = ({ showNames, meetings, disabled }) => {
  const { launchMeeting } = useMeeting()
  const buttons: ReactNodeArray = []
  meetings.map((meeting, index) => {
    buttons.push(
      <button
        title={
          disabled
            ? 'สามารถเข้าสู่ห้องเรียนก่อนเวลาได้ 10 นาที'
            : 'เข้าสู่ห้องเรียน จำเป็นต้องมี Zoom ติดตั้งลงในอุปกรณ์แล้ว'
        }
        key={index}
        disabled={disabled}
        className="zoom-btn w-full"
        onClick={() => launchMeeting(meeting)}
      >
        {disabled ? 'Not In Time' : 'Launch Meetings'} {showNames && ' : ' + meeting.name}
      </button>
    )
  })
  return <div className="px-8 w-full max-w-sm">{buttons}</div>
}

export function GenerateTeacherName(teacher: string[]): ReactNodeArray {
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

function MeetingInfo({ slot, disabled }: MeetingMetaProps): JSX.Element {
  const [meeting, setMeeting] = useState<Meeting[]>([])
  const { ready, meeting: _meeting } = useMeeting()
  useEffect(() => {
    if (!_meeting || !slot) return
    setMeeting(_meeting.filter((m) => slot.teacher.includes(m.name)))
  }, [_meeting, slot])
  if (!ready || !slot) return null
  return (
    <div className="flex flex-col md:grid md:grid-cols-2 w-full md:divide-x divide-gray-400 text-center">
      <div className="flex flex-col justify-center items-center">
        <div className="text-2xl p-4 text-blue-600 font-medium px-8 max-w-md">
          {meeting.length > 0 &&
            slot.code[0].match(/([0-9]){4}\w/g) !== null &&
            meeting[0].subject + ' : '}
          {slot.code.length > 1 && <br />}
          {slot.code.join(' , ')}
        </div>
        {slot.teacher.length > 0 && (
          <span className="px-4 text-blue-600">สอนโดย {GenerateTeacherName(slot.teacher)}</span>
        )}
        <span className="font-light p-2">
          {slot.start} น. - {slot.end} น.
        </span>
      </div>
      <div className="flex flex-col justify-center items-center">
        {meeting.length === 0 || meeting[0].meet ? (
          <MeetingNotFound />
        ) : (
          <MeetingJoin meetings={meeting} showNames={meeting.length != 1} disabled={disabled} />
        )}
      </div>
    </div>
  )
}

function MeetingPending({ slot }): JSX.Element {
  if (!slot) return null
  return (
    <>
      {slot.code.join(' , ')} ({GenerateTeacherName(slot.teacher)}) : {slot.start} น.
    </>
  )
}

export default function TimeSlotsComponent(): JSX.Element {
  const { add, schedule, date, curDay } = useMeeting()
  const [nextPage, setNextPage] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [memory, _setMemory] = useState<TimeSlotsMemory>({ active: null, next: null })
  const [memoryQueue, setQueue] = useState<MemoryQueue>(null)
  const [show, setShow] = useState(true)
  const [state, setState] = useState<State>('')

  useEffect(() => {
    function getActualTime(t: string): string {
      return dayjs()
        .hour(parseInt(t.slice(0, 2)))
        .minute(parseInt(t.slice(3)))
        .subtract(10, 'minutes')
        .format('HH:mm')
    }
    const inTimeRange = (time: string, slot: TimeSlots): boolean => {
      return slot && time >= getActualTime(slot.start) && time < slot.end
    }
    const inNextRange = (time: string, slot: TimeSlots, next: TimeSlots): boolean => {
      return slot && next && time >= getActualTime(next.start) && time < slot.end
    }
    const setMemory = (queue: MemoryQueue): void => {
      // Compare the previous state and the current state
      if (
        (queue.slots.active === memory.active &&
          queue.slots.next === memory.next &&
          queue.state === state) ||
        memoryQueue !== null
      )
        return
      setQueue(queue)
      setNextPage(false)
      setShow(false)
    }
    let _isMounted = true
    if (!_isMounted) return
    if (!schedule) {
      setState('')
      return
    }
    if (schedule[curDay]) {
      const timeString = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      const target = schedule[curDay]
      // If the time is still in range, don't check anything.
      if (inTimeRange(timeString, memory.active)) {
        setDisabled(!inNextRange(timeString, memory.active, memory.next))
        return
      }
      // Out of range, start recheck
      if (timeString < getActualTime(target[0].start)) {
        setMemory({ slots: { active: null, next: target[0] }, state: 'start' })
        return
      }
      if (timeString > target[target.length - 1].end) {
        setMemory({ slots: { active: null, next: null }, state: 'end' })
        return
      }
      for (let i = 0; i < target.length; i++) {
        if (inTimeRange(timeString, target[i])) {
          setMemory({
            slots: { active: target[i], next: target[i + 1] ? target[i + 1] : null },
            state: 'active',
          })
          setDisabled(!inNextRange(timeString, target[i], target[i + 1]))
          return
        } else if (
          target[i + 1] &&
          timeString > target[i].end &&
          timeString < getActualTime(target[i + 1].start)
        ) {
          setMemory({ slots: { active: null, next: target[i + 1] }, state: 'break' })
          return
        }
      }
    }
    setMemory({ slots: { active: null, next: null }, state: 'active' })
    return () => {
      _isMounted = false
    }
  }, [curDay, schedule, date, memory, memoryQueue, state])
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
  useEffect(() => {
    if (memory.active !== null) {
      memory.active.teacher.map((name) => add(name))
    }
    if (memory.next !== null) {
      memory.next.teacher.map((name) => add(name))
    }
  }, [add, memory])
  return (
    <Transition
      show={show}
      appear={true}
      className="flex flex-1 flex-col justify-center items-center"
      enter="transition-opacity duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      beforeEnter={() => {
        if (memoryQueue) {
          setState(memoryQueue.state)
          _setMemory(memoryQueue.slots)
          setQueue(null)
        }
      }}
      afterLeave={() => setShow(true)}
    >
      {state == '' ? (
        <div className="flex flex-col px-4">
          <h3 className="text-2xl p-4 text-blue-600 font-medium px-8">กำลังโหลด...</h3>
        </div>
      ) : (
        <>
          <PaginationComponent
            className="w-56"
            index={nextPage ? 1 : 0}
            onChange={(index) => setNextPage(index == 1 ? true : false)}
            name={nextPage ? 'รายวิชาต่อไป' : 'รายวิชาปัจจุบัน'}
            showIcons={!!memory.next && state === 'active'}
            length={2}
          />
          <MeetingInfo
            slot={nextPage ? memory.next : memory.active}
            disabled={nextPage && disabled}
          />
          {!memory.active && (
            <>
              <div className="text-2xl p-8 text-green-600 font-medium">ไม่มีคาบเรียนในตอนนี้</div>
              <span className="text-sm font-light creative-font px-4 py-1">{message}</span>
            </>
          )}
          {memory.next && (
            <span className="text-center mt-4 text-sm border-t-2 border-gray-300 w-full pt-4 font-light px-4">
              {nextPage ? 'รายวิชาปัจจุบัน' : 'รายวิชาต่อไป'} -{' '}
              <MeetingPending slot={nextPage ? memory.active : memory.next} />
            </span>
          )}
        </>
      )}
    </Transition>
  )
}
