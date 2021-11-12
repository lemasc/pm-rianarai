import { CourseWork, WorkState } from '@/shared-types/classroom'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

type WorkStateWithLate = WorkState | 'LATE'

export function createState(state: WorkState, work: CourseWork): WorkStateWithLate {
  if (!isWorkSubmitted(state) && isLate(work)) {
    return 'LATE'
  }
  return state ?? 'CREATED'
}

export function isLate(work: CourseWork) {
  const dueDate = createDueDate(work)
  return dueDate && dayjs().isAfter(dueDate)
}

export function isWorkSubmitted(state?: WorkState) {
  return state && (state === 'TURNED_IN' || state === 'RETURNED')
}

export function createDueDate(work: CourseWork) {
  if (!work || !work.dueDate) return undefined
  let instance = dayjs.utc(Object.values(work.dueDate).join('/'))
  if (work.dueTime.hours) {
    instance = instance.hour(work.dueTime.hours).minute(work.dueTime.minutes ?? 0)
  } else {
    instance = instance.hour(23).minute(59)
  }
  return instance
}

export function getColor(state: WorkStateWithLate) {
  switch (state) {
    case 'TURNED_IN':
      return 'text-green-500'
    case 'LATE':
      return 'text-red-500'
    default:
      return 'text-blue-500'
  }
}

export function getStateName(state: WorkStateWithLate) {
  switch (state) {
    case 'RETURNED':
      return 'ส่งคืนแล้ว'
    case 'TURNED_IN':
      return 'ส่งแล้ว'
    case 'LATE':
      return 'เลยกำหนด'
    default:
      return 'มอบหมายแล้ว'
  }
}
