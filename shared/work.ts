import { CourseWork, WorkState } from '@/shared-types/classroom'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

type WorkStateWithLate = WorkState | 'LATE'

export function createState(state: WorkState, work: CourseWork): WorkStateWithLate {
  const dueDate = createDueDate(work)
  if (!isWorkSubmitted(state) && dueDate && dayjs().isAfter(dueDate)) {
    return 'LATE'
  }
  return state ?? 'CREATED'
}

export function isWorkSubmitted(state: WorkState) {
  return state === 'TURNED_IN' || state === 'RETURNED'
}

export function createDueDate(work: CourseWork) {
  if (!work || !work.dueDate) return undefined
  let instance = dayjs.utc(Object.values(work.dueDate).join('/'))
  if (work.dueTime.hours && work.dueTime.minutes) {
    instance = instance.hour(work.dueTime.hours).minute(work.dueTime.minutes)
  } else {
    instance = instance.hour(23).minute(59)
  }
  return instance
}

export function getColor(state: WorkStateWithLate) {
  switch (state) {
    case 'RETURNED':
      return 'text-blue-500'
    case 'TURNED_IN':
      return 'text-green-500'
    case 'LATE':
      return 'text-red-500'
    default:
      return 'text-gray-800'
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
