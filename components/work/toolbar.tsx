import { FC, ComponentProps, Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ClockIcon, MenuIcon, SearchIcon, CheckIcon } from '@heroicons/react/outline'
import { SelectData } from '@/components/layout/select'

import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
dayjs.extend(weekday)

type ToolbarProps = {
  onMenu: () => void
  onSearch: (search: string) => void
  time: SelectData<TimeRange>
  setTime: (time: SelectData<TimeRange>) => void
}

type ButtonProps = {
  icon: FC<ComponentProps<'svg'>>
  clickable?: boolean
  onClick?: () => void
  className?: string
  title: string
}

function ToolbarButton(props: ButtonProps): JSX.Element {
  return (
    <button
      onClick={props.onClick}
      title={props.title}
      className={`p-4 dark:bg-gray-900 ${props.className ? props.className : ''} ${
        props.clickable ? 'hover:bg-gray-50 dark:hover:bg-black' : ''
      }`}
    >
      <props.icon className="h-5 w-5" />
    </button>
  )
}
export type TimeRange = {
  startTime: number
  endTime: number
}

export const timeList: SelectData<TimeRange>[] = [
  {
    name: 'สัปดาห์นี้',
    startTime: dayjs().weekday(0).hour(0).minute(0).second(0).unix(),
    endTime: dayjs().weekday(7).hour(0).minute(0).second(0).unix(),
  },
  {
    name: 'อีก 7 วัน',
    startTime: dayjs().hour(0).minute(0).second(0).unix(),
    endTime: dayjs().add(8, 'days').hour(0).minute(0).second(0).unix(),
  },
  {
    name: 'ก่อนหน้านี้',
    startTime: dayjs('2021-06-01').unix(),
    endTime: dayjs().unix(),
  },
  {
    name: 'อีก 30 วัน',
    startTime: dayjs().subtract(1, 'month').hour(0).minute(0).second(0).unix(),
    endTime: dayjs().add(1, 'month').hour(0).minute(0).second(0).unix(),
  },
  {
    name: 'นานกว่านั้น',
    startTime: dayjs().add(1, 'month').hour(0).minute(0).second(0).unix(),
    endTime: dayjs('2022-06-01').unix(),
  },
  {
    name: 'แสดงทั้งหมด',
    startTime: dayjs('2021-06-01').unix(),
    endTime: dayjs('2022-06-01').unix(),
  },
]

export default function Toolbar({ onMenu, onSearch, time, setTime }: ToolbarProps): JSX.Element {
  return (
    <div className="flex flex-row border-b-2 divide-x relative">
      <ToolbarButton
        clickable={true}
        title="เปิดเมนู"
        icon={MenuIcon}
        className="md:hidden"
        onClick={() => onMenu()}
      />
      <ToolbarButton title="ค้นหา" icon={SearchIcon} />
      <input
        onChange={(e) => onSearch(e.target.value)}
        className="h-full focus:outline-none flex-grow px-4 font-light sarabun-font sm:text-sm dark:bg-gray-900"
        type="search"
      />
      <Listbox value={time} onChange={setTime}>
        <Listbox.Button as="div">
          <ToolbarButton clickable={true} title="เวลา" icon={ClockIcon} />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="mt-14 z-10 right-0 absolute py-1 text-sm bg-gray-50 dark:bg-gray-900 border dark:border-white rounded-lg bg-opacity-90 focus-visible:outline-none focus-visible:ring backdrop-filter backdrop-blur-lg ">
            {timeList.map((item) => (
              <Listbox.Option
                key={item.name}
                className={({ active }) =>
                  `${
                    active ? 'cursor-pointer' : 'text-gray-900 dark:text-gray-100'
                  } cursor-default select-none relative py-2 pl-10 pr-8 dark:hover:bg-gray-900 hover:bg-gray-100 `
                }
                value={item}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`${
                        selected ? 'font-medium' : 'font-normal'
                      } block truncate cursor-pointer`}
                    >
                      {item.name}
                    </span>
                    {selected ? (
                      <span
                        className={`text-apple-400 absolute inset-y-0 left-0 flex items-center pl-3`}
                      >
                        <CheckIcon className="w-5 h-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  )
}
