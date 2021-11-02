import dayjs from 'dayjs'
import { ReactNode, useEffect, useState } from 'react'
import { GenerateTeacherName } from './timeslots/info'
import { useWindowWidth } from '@react-hook/window-size/throttled'

import { LegacyMeeting, TimeSlots } from '@/types/meeting'
import PaginationComponent from './layout/pagination'
import { useSchedule } from '@/shared/api'
import ModalComponent from './modal'
import { useAuth } from '@/shared/authContext'
import { useCollection, Document } from 'swr-firestore-v9'
import { useForm } from 'react-hook-form'
import { List } from 'immutable'
import { collection, getDocs, getDocsFromServer, onSnapshot } from '@firebase/firestore'
import { db } from '@/shared/firebase'

type dataTimeSlots = {
  start: string[]
  end: string[]
}
const timetable: dataTimeSlots = {
  start: [
    '08:30',
    '09:20',
    '10:10',
    '10:30',
    '11:20',
    '12:10',
    '13:00',
    '13:50',
    '14:40',
    '15:30',
    '16:20',
  ],
  end: [
    '09:20',
    '10:10',
    '10:30',
    '11:20',
    '12:10',
    '13:00',
    '13:50',
    '14:40',
    '15:30',
    '16:20',
    '17:10',
  ],
}

function TimeSlotsData({ data }: { data: TimeSlots }): JSX.Element {
  return (
    <>
      <span className="text-lg py-2 font-bold sarabun-font">{data.code.join(',')}</span>
      {data.teacher.length !== 0 && (
        <div className="flex flex-row space-x-1 justify-center w-full">
          {GenerateTeacherName(data.teacher)}
        </div>
      )}
    </>
  )
}

type ModalState = {
  show: boolean
  index?: number
}

export default function TimetableComponent(): JSX.Element {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const daysTH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  const [curDay, setCurday] = useState<number>(dayjs().day())
  const [splash, setSplash] = useState(false)
  const { metadata } = useAuth()
  const [meeting, setMeeting] = useState<Document<LegacyMeeting>[]>(undefined)
  const [data, setData] = useState<Record<string, List<TimeSlots>> | undefined>()
  const [modal, setModal] = useState<ModalState>({
    show: false,
  })
  const [editMode, setEditMode] = useState(false)
  const [use2Slots, set2Slots] = useState(false)
  const width = useWindowWidth()
  // BREAKPOINT Breakpoints
  const BREAKPOINT = 640
  const break10Class = 'bg-green-500 bg-opacity-40 italic'
  const breakClass = 'bg-yellow-500 bg-opacity-40 italic'
  const generatePendingSlots = (slot: List<TimeSlots>): ReactNode[]=> {
    // Get index of the last end time in schedule
    const lastIndex = timetable.end.indexOf(slot.get(slot.size - 1).end)
    return Array(timetable.start.length - lastIndex - 2).fill(<td></td>)
  }
  const calculateColSpan = (slot: TimeSlots): number | undefined => {
    return timetable.end.indexOf(slot.end) - timetable.start.indexOf(slot.start) + 1
  }

  const { handleSubmit, register, reset, setValue } = useForm<TimeSlots>()

  function get(obj: 'start' | 'end') {
    let index = 0
    if (modal.index === undefined && data && data[days[curDay]]?.size > 0) {
      const time = Array.from(data[days[curDay]])
      const d = time[time.length - 1]
      index = timetable.end.indexOf(d.end) + 1
      if (index === 2 || index === 5) index++
    }
    if (use2Slots && obj == 'end' && timetable[obj].length > index + 1) index++

    return timetable[obj].slice(index)
  }
  const defaults: Record<string, List<TimeSlots>> = {
    monday: List(),
    tuesday: List(),
    wednesday: List(),
    thursday: List(),
    friday: List(),
  }
  useEffect(() => {
    if (!metadata) return
    const key = `timetable-${metadata.class}`
    const storage = JSON.parse(localStorage.getItem(key))
    const _Set = (data): List<TimeSlots> => {
      return Object.keys(data).length > 0 ? List(data) : List()
    }
    if (!splash) {
      console.log(storage)
      setMeeting(JSON.parse(localStorage.getItem('meetings')))
      if (!storage) {
        setData(defaults)
      } else {
        setData({
          monday: _Set(storage.monday),
          tuesday: _Set(storage.tuesday),
          wednesday: _Set(storage.wednesday),
          thursday: _Set(storage.thursday),
          friday: _Set(storage.friday),
        })
      }

      setSplash(true)
      return
    }
    console.log(data)
    localStorage.setItem(key, JSON.stringify(data))
  }, [data])

  /*
  useEffect(() => {
    ;(async () => {

      const data = await getDocs(collection(db, "meetings"))
      const meetings = data.docs.map(d => ({id: d.id, ...d.data()}))
      console.log(meetings)
      localStorage.setItem("meetings",JSON.stringify(meetings))
    })()
  })

  */
  function setDayData(callback: (day: List<TimeSlots>) => List<TimeSlots>) {
    return setData((data) => ({
      ...data,
      [days[curDay]]: callback(data[days[curDay]]),
    }))
  }
  function onSubmit(form: TimeSlots) {
    const data = {
      ...form,
      id: form.teacher.map((c) => {
        console.log(meeting)
        const index = meeting.findIndex((m) => m.name === c)
        if (index === -1) return ''
        return meeting.at(index).id
      }),
    } as TimeSlots
    const doc = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.filter((v) => v !== '') : value,
      ])
    ) as TimeSlots
    console.log('Doc', doc)
    setDayData((day) => (modal.index !== undefined ? day.set(modal.index, doc) : day.push(doc)))
    reset()
    setModal((m) => ({ ...m, show: false }))
  }
  return (
    <div className={!editMode ? 'whitespace-nowrap block' : 'min-w-min flex flex-col'}>
      <div className="flex flex-row px-4 md:px-0 py-4 gap-4 flex-wrap">
        {editMode && (
          <button
            onClick={() => setModal({ show: true })}
            className="btn px-4 py-2 bg-blue-500 ring-blue-500 text-white"
          >
            Add
          </button>
        )}
        <button
          onClick={() => setEditMode(!editMode)}
          className="btn px-4 py-2 bg-green-500 ring-green-500 text-white"
        >
          {editMode ? 'Disable' : 'Enable'} Editor Mode
        </button>
        <button
          onClick={() => set2Slots(!use2Slots)}
          className="btn px-4 py-2 bg-yellow-400 ring-yellow-500"
        >
          {use2Slots ? 'Disable' : 'Enable'} Two slots mode
        </button>
      </div>
      {editMode && (
        <PaginationComponent
          className="w-48"
          index={curDay}
          onChange={setCurday}
          name={daysTH[curDay]}
          showIcons={true}
          length={7}
        />
      )}

      <ModalComponent
        size="max-w-lg"
        title="Controller"
        closable={true}
        onClose={() => {
          reset()
          setModal((m) => ({ ...m, show: false }))
        }}
        show={modal.show}
      >
        <form className="p-4 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-container sarabun-font">
            <span>Start:</span>
            <select {...register('start')}>
              {get('start').map((m, i) => (
                <option key={i}>{m}</option>
              ))}
            </select>
            <span>End:</span>
            <select {...register('end')}>
              {get('end').map((m, i) => (
                <option key={i}>{m}</option>
              ))}
            </select>
            <span>Code</span>
            <div className="flex flex-col gap-2">
              <input type="text" placeholder="Code-0" {...register('code.0')} />
              {metadata && (metadata.class.toString().slice(0,1) <= "4" || metadata.class.toString().endsWith('3')) && (
                <input type="text" placeholder="Code-1" {...register('code.1')} />
              )}
            </div>

            <span>Name</span>
            <div className="w-full flex flex-col gap-2">
              <input
                className="w-full"
                placeholder="Name-0"
                type="text"
                list="teachers"
                {...register('teacher.0')}
              />
              <input
                className="w-full"
                placeholder="Name-1"
                type="text"
                list="teachers"
                {...register('teacher.1')}
              />

              <datalist id="teachers">
                {meeting?.map((d) => (
                  <option key={d.id}>{d.name}</option>
                ))}
              </datalist>
            </div>
          </div>
          <button
            type="submit"
            className="btn w-full text-white bg-apple-500 ring-apple-500 px-4 py-2"
          >
            Apply
          </button>
        </form>
      </ModalComponent>

      <main className="py-4 flex items-center justify-center">
        {editMode ? (
          <>
            {data && data[days[curDay]] ? (
              <>
                <table className="timetable w-full">
                  <thead className="bg-gray-50 dark:bg-black">
                    <tr>
                      <th scope="col">เวลา</th>
                      <th scope="col">คาบเรียน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.from(data[days[curDay]]).map((d, i) => (
                      <>
                        <tr key={d.start}>
                          <td
                            title="Remove"
                            onClick={() => {
                              if (confirm(`Delete slot ${d.start} - ${d.end}?`)) {
                                setDayData((day) => {
                                  return day.remove(i)
                                })
                              }
                            }}
                          >
                            {d.start} - {d.end}
                          </td>
                          <td
                            onClick={() => {
                              Object.entries(d).map(([key, value]) => setValue(key as any, value))
                              setModal({
                                show: true,
                                index: i,
                              })
                            }}
                          >
                            <TimeSlotsData data={d} />
                          </td>
                        </tr>
                        {d.end == '10:10' && (
                          <tr key="break10" className={break10Class}>
                            <td>10:10 - 10:30</td>
                            <td>พัก 20 นาที</td>
                          </tr>
                        )}
                        {d.end == '12:10' && (
                          <tr key="break" className={breakClass}>
                            <td>12:10 - 13:00</td>
                            <td>พักกลางวัน</td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="text-lg text-red-500 p-12 font-medium">ไม่มีข้อมูลตารางเรียน</div>
            )}
          </>
        ) : (
          <table className="timetable">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="sticky -left-0.5 bg-gray-50 dark:bg-gray-900 z-20 border">วัน</th>
                {timetable.start.map((d, i) => (
                  <>
                    <th key={d}>
                      {d} - {timetable.end[i]}
                    </th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-light">
              {days.map((day, dayIndex) => (
                <>
                  {data && data[day] && (
                    <tr>
                      <td
                        className={
                          'sticky -left-0.5 font-medium border ' +
                          (dayIndex === curDay
                            ? 'bg-bright-sun-400 text-gray-900'
                            : 'bg-gray-50 dark:bg-gray-900')
                        }
                      >
                        {daysTH[dayIndex]}
                      </td>
                      {data[day] &&
                        Array.from(data[day]).map((d, i) => (
                          <>
                            <td colSpan={calculateColSpan(d)} key={d.code.toString()}>
                              <TimeSlotsData data={d} />
                            </td>
                            {day === 'monday' && (
                              <>
                                {d.end == '10:10' && (
                                  <td rowSpan={5} key="break10" className={break10Class}>
                                    พัก 20 นาที
                                  </td>
                                )}
                                {d.end == '12:10' && (
                                  <td rowSpan={5} key="break" className={breakClass}>
                                    พักกลางวัน
                                  </td>
                                )}
                               
                              </>
                            )}
                             {i === data[day]?.size - 1 && generatePendingSlots(data[day])}
                          </>
                        ))}
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
