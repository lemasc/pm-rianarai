import { FC, ComponentProps, ReactNodeArray } from 'react'
import {
  AcademicCapIcon,
  CheckIcon,
  StarIcon,
  XIcon,
  ClipboardListIcon,
  ArchiveIcon,
} from '@heroicons/react/outline'

type ButtonProps = { active: boolean; children: ReactNodeArray; onClick: () => void }
function StatusSelectorButton({ active, children, onClick }: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`${
        active
          ? 'border-l-2 text-blue-600 border-blue-500 dark:text-blue-500'
          : 'mx-0.5 text-gray-700 dark:text-gray-400 '
      } hover:text-blue-600 dark:hover:text-blue-500 px-4 py-2 gap-4 flex flex-row items-center w-full`}
    >
      {children}
    </button>
  )
}
export type Selector = 'missing' | 'not-turned-in' | 'turned-in' | 'important' | 'archived' | ''
export type StatusButton = {
  title: string
  status: Selector
  icon: FC<ComponentProps<'svg'>>
}

export const buttons: StatusButton[] = [
  {
    title: 'งานทั้งหมด',
    status: '',
    icon: AcademicCapIcon,
  },
  {
    title: 'สิ่งสำคัญ',
    status: 'important',
    icon: StarIcon,
  },
  { title: 'ยังไม่ได้ส่ง', status: 'not-turned-in', icon: ClipboardListIcon },
  { title: 'ส่งแล้ว', status: 'turned-in', icon: CheckIcon },
  { title: 'ขาดส่ง', status: 'missing', icon: XIcon },
  { title: 'ที่จัดเก็บ', status: 'archived', icon: ArchiveIcon },
]
type SelectorProps = {
  selected: StatusButton
  onChange: (selected: StatusButton) => void
}
export default function StatusSelector({ selected, onChange }: SelectorProps): JSX.Element {
  return (
    <>
      {buttons.map((b) => (
        <StatusSelectorButton onClick={() => onChange(b)} key={b.title} active={selected == b}>
          <b.icon className="w-6 h-6" />
          {b.title}
        </StatusSelectorButton>
      ))}
    </>
  )
}
