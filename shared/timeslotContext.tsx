import { createContext, useContext, useEffect, useState } from 'react'
import dayjs from 'dayjs'

import { State, TimeSlots, TimeSlotsMemory } from '@/types/meeting'
import { useRouter } from 'next/router'
import { useSchedule } from './api'
import { emitEvent } from './native'
import { useAuth } from './authContext'

export interface Schedule {
  [days: string]: TimeSlots[]
}

export interface ITimeSlotContext {
  /**
   * Current day. (Sunday, Monday, ...)
   */
  curDay: string
  /**
   * The global Date instance, shared between components.
   */
  date: Date
  /**
   * The slots that are currently running.
   */
  slots: TimeSlotsMemory
  /**
   * The current timetable state.
   */
  state: State
  /**
   * Indicates whether the next slot is in time or not.
   */
  nextSlot: boolean
}

export const timeslotContext = createContext<ITimeSlotContext | undefined>(undefined)

export const useTimeslot = (): ITimeSlotContext => {
  const ctx = useContext(timeslotContext)
  if (!ctx) throw new Error('useTimeslot must be within TimeSlotProvider')
  return ctx
}

/**
 * The application requires a background service,
 * which will listen and update slots according to the current time.
 *
 * We move the same logic code into a seperate global context
 * to make it simpler to do any other tasks (such as notifications).
 */
export function useProvideTimeslot(): ITimeSlotContext {
  const { metadata } = useAuth()
  const router = useRouter()
  const { data: schedule } = useSchedule()
  const [currentClass, setClass] = useState<string | null>(null)
  const [nextSlot, setNextSlot] = useState(false)
  const [slots, setSlots] = useState<TimeSlotsMemory>({ active: null, next: null })
  const [state, setState] = useState<State>('')
  const [splash, setSplash] = useState(false)
  const [notif, setNotif] = useState<Notification>(undefined)
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const [date, setDate] = useState(new Date())
  const [curDay, setCurDay] = useState<string>('sunday')

  useEffect(() => {
    const timerID = setInterval(() => {
      const d = new Date()
      setDate(d)
      setCurDay(days[d.getDay()])
    }, 1000)
    return () => clearInterval(timerID)
  })

  // Main logic code.
  useEffect(() => {
    if (!metadata) {
      setClass(null)
      return
    }
    function getActualTime(t: string): string {
      return dayjs()
        .hour(parseInt(t.slice(0, 2)))
        .minute(parseInt(t.slice(3)))
        .subtract(10, 'minutes')
        .format('HH:mm')
    }
    const inTimeRange = (time: string, slot: TimeSlots): boolean => {
      return slot && time >= getActualTime(slot.start) && time <= slot.end
    }
    const inNextRange = (time: string, slot: TimeSlots, next: TimeSlots): boolean => {
      return slot && next && time >= getActualTime(next.start) && time < slot.end
    }
    if (!schedule) return setState('')
    if (schedule[curDay]) {
      const timeString = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      const target = schedule[curDay]
      // If the time is still in range, don't check anything.
      if (inTimeRange(timeString, slots.active) && metadata.class === currentClass) {
        setNextSlot(inNextRange(timeString, slots.active, slots.next))
        setState('active')
        return
      }

      // Out of range, start recheck
      if (timeString < getActualTime(target[0].start)) {
        setSlots({ active: null, next: target[0] })
        setState('start')
        return
      }
      if (timeString > target[target.length - 1].end) {
        setSlots({ active: null, next: null })
        setState('end')
        return
      }
      for (let i = 0; i < target.length; i++) {
        if (inTimeRange(timeString, target[i])) {
          setSlots({ active: target[i], next: target[i + 1] ? target[i + 1] : null })
          setState('active')
          setNextSlot(inNextRange(timeString, target[i], target[i + 1]))
        } else if (
          target[i + 1] &&
          timeString > target[i].end &&
          timeString < getActualTime(target[i + 1].start)
        ) {
          setSlots({ active: null, next: target[i + 1] })
          setState('break')
        }
      }
      setClass(metadata.class.toString())
      return
    }
    setSlots({ active: null, next: null })
    setState('active')
  }, [schedule, curDay, date, slots.active, slots.next, metadata, currentClass])

  // Notifications
  useEffect(() => {
    if (router.pathname.includes('splash')) return
    function send(slot: TimeSlots, now?: boolean): void {
      setNotif((notif) => {
        if (notif) notif.close()
        const newNotif = new Notification(
          `รายวิชา${now ? 'ปัจจุบัน' : 'ต่อไป'} - ${slot.start} น.`,
          {
            body: `${slot.code.join('/')} (${slot.teacher.join('/')})`,
          }
        )
        newNotif.onclick = () => {
          emitEvent('focus-window')
          router.replace('/')
        }
        return newNotif
      })
    }
    if (slots.active !== null && !splash) {
      send(slots.active, true)
      setSplash(true)
    } else if (state === 'active' && slots.next !== null && nextSlot) {
      send(slots.next)
    }
  }, [slots.next, slots.active, nextSlot, router, state, splash])
  return {
    date,
    curDay,
    slots,
    state,
    nextSlot,
  }
}
