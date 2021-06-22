import axios, { CancelTokenSource } from 'axios'
import Loader from 'react-loader-spinner'
import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import {
  AcademicCapIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import LayoutComponent, { CONTAINER, HEADER } from '../components/layout'
import { APIResponse } from '../shared/api'
import { useAuth } from '../shared/authContext'
import { db } from '../shared/db'
import { ClassroomCourseResult } from './api/classroom/courses'
import { ClassroomCourseWorkResult } from './api/classroom/courses/[cid]'
import SingletonRouter, { Router, useRouter } from 'next/router'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import SelectBox, { SelectData } from '../components/select'
import { Disclosure, Transition } from '@headlessui/react'
import { useWindowWidth } from '@react-hook/window-size/throttled'

dayjs.extend(weekday)

function ClassworkList({ data }: { data: ClassroomCourseWorkResult[] }): JSX.Element {
  data = data
    .sort((prev, next) => (prev.dueDate ? (prev.dueDate > next.dueDate ? 1 : -1) : 0))
    .reverse()
  return (
    <div className="bg-gray-50 border border-collapse overflow-y-auto h-72">
      {data.length > 0 ? (
        data.map((d) => (
          <a
            href={'https://classroom.google.com/c/' + d.slug + '/details'}
            key={d.id}
            target="_blank"
            rel="noreferer noopener"
            className="border flex flex-row p-4 hover:bg-gray-100 cursor-pointer font-light"
          >
            <div className="flex flex-col flex-grow">
              <b>{d.title}</b>
              <span className="pt-2 text-sm">
                {d.dueDate ? (
                  <> ส่งวันที่ {dayjs.unix(d.dueDate).format('DD/MM/YYYY HH:mm น.')}</>
                ) : (
                  <>ไม่มีกำหนดส่ง</>
                )}
              </span>
            </div>
            <span className="ml-4 flex w-8 h-8 justify-end items-center">
              <ExternalLinkIcon className="text-gray-400 w-5 h-5" />
            </span>
          </a>
        ))
      ) : (
        <div className="border flex-grow h-full items-center justify-center flex flex-col p-4 hover:bg-gray-100 cursor-pointer font-light">
          ไม่มีข้อมูล
        </div>
      )}
    </div>
  )
}

type DisclosureProps = {
  classWork: ClassroomCourseWorkResult[]
  state: 'turned-in' | 'missing' | ''
  children: JSX.Element
}

export function WorkDisclosure({ classWork, state, children }: DisclosureProps) {
  const width = useWindowWidth()
  function filterWork(c: ClassroomCourseWorkResult) {
    if (state === 'turned-in') return c.state === 'TURNED_IN' || c.state === 'RETURNED'
    return (
      c.state !== 'TURNED_IN' &&
      c.state !== 'RETURNED' &&
      (state === '' ? !checkDuedate(c.dueDate) : checkDuedate(c.dueDate))
    )
  }
  function checkDuedate(date: number): boolean {
    if (!date) return true
    return dayjs().unix() > date
  }
  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button className={'w-full' + (!open ? ' rounded' : '')}>
            {children}
          </Disclosure.Button>
          <Transition
            show={open || width >= 900}
            enter="transition duration-300 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-150 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel static>
              <ClassworkList data={classWork.filter((c) => filterWork(c))} />
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}

type TimeRange = {
  startTime: number
  endTime: number
}

export const time: SelectData<TimeRange>[] = [
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
    name: 'เดือนนี้',
    startTime: dayjs().subtract(1, 'month').hour(0).minute(0).second(0).unix(),
    endTime: dayjs().add(1, 'month').hour(0).minute(0).second(0).unix(),
  },
  {
    name: 'นานกว่านั้น',
    startTime: dayjs().add(1, 'month').hour(0).minute(0).second(0).unix(),
    endTime: dayjs('2022-06-01').unix(),
  },
]

export default function WorkPage(): JSX.Element {
  const source: CancelTokenSource = axios.CancelToken.source()
  const router = useRouter()
  const [needsFetch, setFetch] = useState(false)
  const [load, setLoad] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [selectedTime, setTime] = useState<SelectData<TimeRange>>(time[0])
  const { classroom } = useAuth()
  const [classWork, setClassWork] = useState<ClassroomCourseWorkResult[]>([])
  // Main Fetcher hook
  useEffect(() => {
    async function getCourses(): Promise<ClassroomCourseResult[][]> {
      try {
        const courses = await axios.get<APIResponse<ClassroomCourseResult[][]>>(
          '/api/classroom/courses',
          { cancelToken: source.token }
        )
        return courses.data.data
      } catch (err) {
        return []
      }
    }
    async function getWork(
      courseId: string,
      accountId: number
    ): Promise<ClassroomCourseWorkResult[]> {
      try {
        const work = await axios.get<APIResponse<ClassroomCourseWorkResult[]>>(
          '/api/classroom/courses/' + courseId,
          {
            params: {
              account: accountId,
            },
            cancelToken: source.token,
          }
        )
        work.data.data.map((d) => {
          db.courseWork.put({
            courseId,
            ...d,
          })
        })
      } catch (err) {
        return []
      }
    }
    async function fetchAll(): Promise<void> {
      setFetching(true)
      const accounts = await getCourses()
      // Get all data from the API and update database recursively
      if (accounts.length === 0) return await fetchAll()
      await Promise.all(
        accounts.map(async (courses, i) => {
          await Promise.all(
            courses.map(async (course) => {
              db.courses.put({
                accountId: i,
                ...course,
              })
              await getWork(course.id, i)
            })
          )
        })
      )
      setFetch(false)
      setFetching(false)
    }

    if (needsFetch && !fetching) fetchAll()
  }, [needsFetch, fetching])
  useEffect(() => {
    ;(async () => {
      const data = await db.courseWork
        .where('dueDate')
        .between(selectedTime.startTime, selectedTime.endTime)
        .toArray()
      setClassWork(data)
      if (!load) setFetch(true)
      setLoad(true)
    })()
  }, [load, selectedTime])
  // Cancel on navigation
  useEffect(() => {
    function beforeunload(e) {
      source.cancel()
      setFetch(false)
    }
    // @ts-ignore This is a hack for override navigation
    SingletonRouter.router.change = (...args) => {
      source.cancel()
      setFetch(false)
      // @ts-expect-error Readonly Router
      Router.prototype.change.apply(SingletonRouter.router, args)
    }

    window.addEventListener('beforeunload', beforeunload)
    return () => {
      // @ts-expect-error Readonly Router
      delete SingletonRouter.router.change
      window.removeEventListener('beforeunload', beforeunload)
    }
  }, [])

  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>งานที่ได้รับ : PM-RianArai</title>
      </Head>
      <LayoutComponent>
        <div className={'flex-1 ' + CONTAINER}>
          <div className={'flex pt-8 flex-row items-center'}>
            <h1 className="text-3xl flex-grow">งานที่ได้รับ</h1>
            {load && classWork && classWork.length > 0 && (
              <>
                <div className="flex flex-col items-start">
                  <span className="font-medium">ช่วงเวลาที่ส่ง</span>
                  <SelectBox data={time} selected={selectedTime} onChange={setTime} />
                </div>
              </>
            )}
          </div>
          {router.query.error && (
            <div className="px-4 py-3 rounded-lg bg-red-200 text-red-700">
              ไม่สามารถเชื่อมต่อบัญชีได้ กรุณาลองใหม่อีกครั้ง
            </div>
          )}

          {classroom &&
            (classroom.length === 0 ? (
              <div className="pb-20 font-light flex flex-col flex-1 items-center justify-center space-y-4">
                <span>ยังไม่ได้เชื่อมต่อกับ Google Classroom</span>
                <button
                  onClick={() => router.push('/api/classroom/authorize')}
                  className="btn text-white px-4 py-2 bg-apple-500 from-apple-500 to-apple-600 ring-apple-500"
                >
                  เชื่อมต่อกับ Classroom
                </button>
              </div>
            ) : (
              <>
                {load && classWork && classroom && classWork.length > 0 ? (
                  <>
                    <span className="text-gray-500 block sm:hidden">
                      คลิกที่ปุ่มแต่ละปุ่มเพื่อดูข้อมูลงาน
                    </span>
                    <div className="pb-20 md:grid md:grid-cols-3 flex flex-col justify-center gap-8">
                      <WorkDisclosure classWork={classWork} state="">
                        <div className="items-center flex flex-row rounded-t-lg bg-gradient-to-b from-yellow-400 to-yellow-500 text-white py-3 px-6">
                          <h4 className="py-2 text-lg font-medium flex-grow">ยังไม่ได้ส่ง</h4>
                          <AcademicCapIcon className="w-10 h-10" />
                        </div>
                      </WorkDisclosure>
                      <WorkDisclosure classWork={classWork} state="turned-in">
                        <div className="items-center flex flex-row rounded-t-lg bg-gradient-to-b from-green-400 to-green-500 text-white py-3 px-6">
                          <h4 className="py-2 text-lg font-medium flex-grow">ส่งแล้ว</h4>
                          <CheckCircleIcon className="w-10 h-10" />
                        </div>
                      </WorkDisclosure>
                      <WorkDisclosure classWork={classWork} state="missing">
                        <div className="items-center flex flex-row rounded-t-lg bg-gradient-to-b from-red-400 to-red-500 text-white py-3 px-6">
                          <h4 className="py-2 text-lg font-medium flex-grow">ขาดส่ง</h4>
                          <XCircleIcon className="w-10 h-10" />
                        </div>
                      </WorkDisclosure>
                    </div>
                  </>
                ) : (
                  <div className="pb-20 font-light flex flex-col flex-1 items-center justify-center space-y-4">
                    <Loader type="TailSpin" color="#2DBE57" height={80} width={80} />
                    <span>กำลังโหลดข้อมูลครั้งแรก อาจใช้เวลา 1-2 นาที</span>
                  </div>
                )}
              </>
            ))}
        </div>
      </LayoutComponent>
    </div>
  )
}
