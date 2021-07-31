import { useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import dayjs from 'dayjs'
import { useMeeting } from '@/shared/meetingContext'
import PaginationComponent from '../layout/pagination'
import { MeetingInfo, MeetingPending } from './info'
import { TimeSlots } from '@/types/meeting'

interface TimeSlotsMemory {
  active: TimeSlots | null
  next: TimeSlots | null
}

interface MemoryQueue {
  slots: TimeSlotsMemory
  state: State
}

type State = 'active' | 'start' | 'break' | 'end' | ''

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
      className="flex flex-1 flex-col justify-center items-center text-center"
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
            className="sm:w-56 w-full"
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
              <div className="text-2xl sm:px-8 px-4 py-8 text-green-600 font-medium">
                ไม่มีคาบเรียนในตอนนี้
              </div>
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
