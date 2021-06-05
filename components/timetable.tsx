import { useDocument } from '@nandorojo/swr-firestore'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useAuth } from '../shared/authContext'
import PaginationComponent from './pagination'
import type { Schedule } from './timeslots'
import { GenerateTeacherName } from './timeslots'
import { useWindowWidth } from '@react-hook/window-size'

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
  return (
    <div>
      <PaginationComponent
        className="w-48"
        index={curDay}
        onChange={setCurday}
        name={daysTH[curDay]}
        showIcons={true}
        length={7}
      />
      <main className="p-4">
        {data && data[days[curDay]] ? (
          <>
            {' '}
            {width < 1200 ? (
              <table className="timetable">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col">เวลา</th>
                    <th scope="col">คาบเรียน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data[days[curDay]].map((d, i) => (
                    <tr key={i}>
                      <td>
                        {d.start} - {d.end}
                      </td>
                      <td>
                        {d.code.join(',')}
                        {d.teacher.length !== 0 && (
                          <>
                            <br />
                            {GenerateTeacherName(d.teacher)}
                          </>
                        )}
                      </td>
                    </tr>
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
                          <span className="text-lg py-2 font-bold sarabun-font">
                            {d.code.join(',')}
                          </span>
                          {d.teacher.length !== 0 && (
                            <div className="flex flex-row space-x-2 justify-center w-full">
                              {GenerateTeacherName(d.teacher)}
                            </div>
                          )}
                        </td>
                        {d.end == '10:10' && (
                          <td key="break10" className="bg-green-500 bg-opacity-40 italic">
                            พัก 10 นาที
                          </td>
                        )}
                        {d.end == '12:10' && (
                          <td key="break" className="bg-yellow-500 bg-opacity-40 italic">
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
