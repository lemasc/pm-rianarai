import { useDocument } from '@nandorojo/swr-firestore'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useAuth } from '../shared/authContext'
import PaginationComponent from './pagination'
import type { Schedule, TimeSlots } from './timeslots'
import { GenerateTeacherName } from './timeslots'
import { useWindowWidth } from '@react-hook/window-size/throttled'

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

export default function TimetableComponent(): JSX.Element {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const daysTH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  const [curDay, setCurday] = useState<number>(dayjs().day())
  const { metadata } = useAuth()
  const { data } = useDocument<Schedule>(metadata ? `classes/${metadata.class}` : null, {
    listen: true,
  })
  const width = useWindowWidth()
  useEffect(() => {
    let _isMounted = true
    if (!_isMounted) return
    if (!data) return
    console.log(data)
    return () => {
      _isMounted = false
    }
  }, [data])
  // Desktop Breakpoints
  const DESKTOP = 1200
  const break10Class = 'bg-green-500 bg-opacity-40 italic'
  const breakClass = 'bg-yellow-500 bg-opacity-40 italic'
  return (
    <div className={width > DESKTOP ? '' : 'w-80 flex flex-col justify-center items-center'}>
      <PaginationComponent
        className="w-48"
        index={curDay}
        onChange={setCurday}
        name={daysTH[curDay]}
        showIcons={true}
        length={7}
      />
      <main className="py-4 flex items-center justify-center">
        {data && data[days[curDay]] ? (
          <>
            {width < DESKTOP ? (
              <table className="timetable w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col">เวลา</th>
                    <th scope="col">คาบเรียน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data[days[curDay]].map((d) => (
                    <>
                      <tr key={d.start}>
                        <td>
                          {d.start} - {d.end}
                        </td>
                        <td>
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
            ) : (
              <table className="timetable">
                <thead className="bg-gray-50">
                  <tr>
                    {data[days[curDay]].map((d) => (
                      <>
                        <th key={d.start}>
                          {d.start} - {d.end}
                        </th>
                        {d.end == '10:10' && <th key="break10_h">10:10 - 10:30</th>}
                        {d.end == '12:10' && <th key="break_h">12:10 - 13:00</th>}
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-light">
                  <tr>
                    {data[days[curDay]].map((d) => (
                      <>
                        <td key={d.code.toString()}>
                          <TimeSlotsData data={d} />
                        </td>
                        {d.end == '10:10' && (
                          <td key="break10" className={break10Class}>
                            พัก 20 นาที
                          </td>
                        )}
                        {d.end == '12:10' && (
                          <td key="break" className={breakClass}>
                            พักกลางวัน
                          </td>
                        )}
                      </>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </>
        ) : (
          <div className="text-lg text-red-500 p-12 font-medium">ไม่มีข้อมูลตารางเรียน</div>
        )}
      </main>
    </div>
  )
}
