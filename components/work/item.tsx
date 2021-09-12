import { ComponentProps, ReactNode, FC } from 'react'
import { XCircleIcon, StarIcon, ArchiveIcon } from '@heroicons/react/outline'
import {
  CheckCircleIcon,
  StarIcon as StarSolidIcon,
  ArchiveIcon as ArchiveSolidIcon,
} from '@heroicons/react/solid'
import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { Document } from 'swr-firestore-v9'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import th from 'dayjs/locale/th'
dayjs.locale(th)
dayjs.extend(LocalizedFormat)

import { useAuth } from '@/shared/authContext'
import { db } from '@/shared/firebase'
import {
  ClassroomCourseWorkResult,
  ClassroomSessionResult,
  WorkState,
  WorkTag,
} from '@/types/classroom'

export function minifiedFields(
  data: Document<ClassroomCourseWorkResult>,
  classroom: ClassroomSessionResult[]
): ClassroomCourseWorkResult {
  const _data = Object.assign({}, data)
  delete _data.exists
  delete _data.hasPendingWrites
  delete _data.__snapshot
  delete _data.id // Added as a firestore doc ID instead
  delete _data.course // Referencing purposes only.
  if (data.course) {
    // Account ID is required to reference on deletion
    _data.accountId = classroom[data.course.accountId].id
  }
  return _data
}

export function checkDuedate(date: number): boolean {
  if (!date) return false
  return dayjs().unix() > date
}
export function checkTurnedIn(state: WorkState): boolean {
  return state === 'TURNED_IN' || state === 'RETURNED'
}

export async function toggleState(data: ClassroomCourseWorkResult, uid: string): Promise<void> {
  if (!data.custom) return
  const ref = doc(db, `users/${uid}/classwork`, data.id)
  await updateDoc(ref, {
    state: checkTurnedIn(data.state) ? 'CREATED' : 'TURNED_IN',
  })
}

type ToggleSvgProps = {
  icon: FC<ComponentProps<'svg'>>
  activeIcon: FC<ComponentProps<'svg'>>
  active: boolean
  className: string
}

type ItemProps = {
  data: ClassroomCourseWorkResult
  onClick: () => void
}

function ToggleSvg({ icon, activeIcon, active, className }: ToggleSvgProps): JSX.Element {
  const Component = active ? activeIcon : icon
  return (
    <Component className={`h-8 w-8 ${active ? className : 'text-gray-500 dark:text-gray-300'}`} />
  )
}

function Badge({ children, className }: { children: ReactNode; className: string }): JSX.Element {
  return (
    <span className={`sarabun-font font-bold ${className} rounded px-2 py-1 break-words`}>
      {children}
    </span>
  )
}

function ItemBadge({ data }: { data: ClassroomCourseWorkResult }): JSX.Element {
  return (
    <div className="flex flex-row gap-2 flex-wrap min-w-0 items-start">
      {data.courseId && data.course ? (
        <Badge className="bg-gray-200 text-gray-600">{data.course.name}</Badge>
      ) : (
        <></>
      )}
      {data.custom ? (
        <Badge className="bg-purple-200 text-purple-600">Manual</Badge>
      ) : (
        <Badge className="bg-apple-200 text-apple-600">Google Classroom</Badge>
      )}
    </div>
  )
}

type TagButtonProps = {
  data: ClassroomCourseWorkResult
  isModal?: boolean
}
export function TagButton({ data, isModal }: TagButtonProps): JSX.Element {
  const { user, classroom } = useAuth()
  async function setTag(tag: WorkTag): Promise<void> {
    const _uniqueTags: WorkTag[] = ['important', 'archived']
    const _data = minifiedFields(data, classroom)

    if (data.dueDate === 0) {
      delete _data.dueDate
    }
    const tags = new Set(data.tags)
    const uniqueTags = (): boolean => {
      const index = _uniqueTags.indexOf(tag)
      if (index === -1) return false
      _uniqueTags.map((t, i) => {
        if (i === index) tags.add(t)
        else if (tags.has(t)) tags.delete(t)
      })
      return true
    }
    if (tags.has(tag)) {
      // Toggle state, remove it
      tags.delete(tag)
    } else if (!uniqueTags()) {
      tags.add(tag)
    }
    if (tags.size === 0 && data.tags) {
      delete _data.tags
    } else {
      _data.tags = Array.from(tags)
    }
    const ref = doc(db, 'users', user.uid, 'classwork', data.id)
    try {
      if (!_data.custom && !_data.tags) {
        await deleteDoc(ref)
      } else {
        await setDoc(ref, { ..._data, dueDate: !_data.dueDate ? 0 : _data.dueDate })
      }
    } catch (err) {
      console.error(err)
    }
  }
  function isTagged(tag: WorkTag): boolean {
    return data.tags && data.tags.includes(tag)
  }
  return (
    <span
      className={`${
        isModal
          ? 'flex-row flex-shrink-0 my-2 flex'
          : 'sm:flex-row flex-col m-4 hidden sm:flex self-stretch '
      } items-center justify-center gap-4 flex-shrink-0`}
    >
      <button
        title={!isTagged('important') ? 'เพิ่มเป็นสิ่งที่สำคัญ' : 'ลบจากสิ่งที่สำคัญ'}
        onClick={() => setTag('important')}
      >
        <ToggleSvg
          className="text-yellow-500"
          active={isTagged('important')}
          activeIcon={StarSolidIcon}
          icon={StarIcon}
        />
      </button>
      <button
        title={!isTagged('archived') ? 'เพิ่มในที่จัดเก็บ' : 'นำออกจากที่จัดเก็บ'}
        onClick={() => setTag('archived')}
      >
        <ToggleSvg
          className="text-blue-500"
          active={isTagged('archived')}
          activeIcon={ArchiveSolidIcon}
          icon={ArchiveIcon}
        />
      </button>
    </span>
  )
}
export function DueDate({ dueDate }: { dueDate?: number }): JSX.Element {
  return dueDate ? <> ส่งวันที่ {dayjs.unix(dueDate).format('lll น.')}</> : <>ไม่มีกำหนดส่ง</>
}

export default function ClassworkItem({ data, onClick }: ItemProps): JSX.Element {
  const { user } = useAuth()
  function getStatus(): string {
    if (checkTurnedIn(data.state)) return 'line-through text-gray-500 dark:text-gray-400'
    if (checkDuedate(data.dueDate)) return 'text-red-500 dark:text-red-400'
    return ''
  }
  //const textClass = 'w-48 sm:w-full sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg'
  return (
    <div
      key={data.id}
      className="dark:border-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-800 cursor-pointer font-light border flex items-start"
    >
      <button
        title="สถานะการส่ง"
        className="flex flex-shrink-0 items-center m-4 self-stretch "
        onClick={() => toggleState(data, user.uid)}
      >
        <ToggleSvg
          className="text-green-500 dark:text-green-300"
          active={checkTurnedIn(data.state)}
          activeIcon={CheckCircleIcon}
          icon={XCircleIcon}
        />
      </button>
      <button
        onClick={onClick}
        className="flex flex-col flex-grow items-start my-4 text-left min-w-0 mr-4"
      >
        <span className={`font-medium ${getStatus()}`}>{data.title}</span>
        <span className="pt-2 text-sm flex flex-col space-y-2 min-w-0 items-start">
          <ItemBadge data={data} />
          <span className="text-gray-500 dark:text-gray-300">
            <DueDate dueDate={data.dueDate} />
          </span>
        </span>
      </button>
      <TagButton data={data} />
    </div>
  )
}
