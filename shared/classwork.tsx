import { APIResponse, ClassroomCourseResult, ClassroomCourseWorkResult } from '@/types/classroom'
import axios, { CancelTokenSource } from 'axios'
import SingletonRouter, { Router } from 'next/router'
import { useEffect, useState } from 'react'

import { db } from '@/shared/db'

type ClassworkHelper = {
  // Classwork result from API.
  classWork: ClassroomCourseWorkResult[] | null
}
/**
 * Classroom API Database fetching utility.
 * @returns Classwork data interface.
 */
export default function useClasswork(): ClassworkHelper {
  const [classWork, setClassWork] = useState<ClassroomCourseWorkResult[] | null>(null)
  const [fetching, setFetching] = useState(false)
  const [needsFetch, setFetch] = useState(false)
  const [load, setLoad] = useState(false)
  const source: CancelTokenSource = axios.CancelToken.source()
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
      // Get all data from the API and update database recursively.
      if (!accounts) return // System Error
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
  }, [needsFetch, fetching, source.token])
  useEffect(() => {
    ;(async () => {
      if (fetching) return
      const data = await db.courseWork.toArray()
      setClassWork(data)
      setLoad((load) => {
        if (!load) setFetch(true)
        return true
      })
    })()
  }, [fetching])
  // Cancel on navigation
  useEffect(() => {
    function beforeunload(): void {
      source.cancel()
      setFetch(false)
    }
    // @ts-expect-error This is a hack for override navigation
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
  }, [source])
  return {
    classWork,
  }
}
