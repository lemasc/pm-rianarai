import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { useAuth } from '../authContext'
import {
  Course,
  CourseWork,
  Material,
  Submission,
  Teacher,
  Topic,
  Announcement,
} from '@/shared-types/classroom'
import { Set, Map } from 'immutable'
import { doc, getDocFromCache, getDocsFromCache, namedQuery } from '@firebase/firestore'
import { db } from '../plugin'
import { useEffect, useState } from 'react'
import { fetchWithIdsMap, useAPIFetcher, useAPIFetcherWithContent } from './base'
import { LegacyMeeting } from '@/types/meeting'
import { useCollection } from 'swr-firestore-v9'

type WithDisplayName = {
  name: string
  displayName?: string
}
export function getName(resource?: WithDisplayName) {
  return resource ? resource.displayName ?? resource.name : undefined
}

export const useSchedule = () => {
  const { metadata, bundle } = useAuth()
  const swr = useSWR(
    bundle && metadata ? ['schedule', metadata.class.toString()] : null,
    async (key, _class) => (await getDocFromCache(doc(db, 'classes', _class))).data() ?? null
  )
  return swr
}

export const useCourses = () => useAPIFetcher<Course>('/courses')

export const useTeachers = () => {
  const { data: courses } = useCourses()
  const { bundle, metadata, user } = useAuth()
  // Stores actual classroom data
  const [classroom, setClassroom] = useState<Map<string, Teacher> | undefined>()
  // Google Classroom Fetch is seperated from the Firestore Cache logic.
  const swr = useSWR(courses && courses.size > 0 ? '/teachers' : null, (key: string) =>
    fetchWithIdsMap<Teacher>(key)
  )
  useEffect(() => {
    swr.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses])
  // Instead of reloading data from firestore everytime.
  // We store this in useSWRInfinite hook to cache and share data between components.
  // This will reduce time to load, and improves performance.
  const {
    data: snapshots,
    setSize,
    size,
  } = useSWRInfinite(
    (index) => bundle && metadata && [`teachers-${index}`, metadata.class.toString()],
    async (key: string) => {
      const query = await namedQuery(db, key)
      if (!query) return []
      return (await getDocsFromCache(query)).docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as unknown as LegacyMeeting[]
    }
  )

  const { data: _googleUserData } = useCollection<Teacher>(
    user ? `users/${user.uid}/courses` : null,
    {
      listen: true,
      where: ['source', '==', 'google'],
    }
  )

  const [googleUserData, setGoogleUserData] = useState<Map<string, Teacher>>(Map())

  useEffect(() => {
    setGoogleUserData(() =>
      Map<string, Teacher>().withMutations((map) => {
        _googleUserData?.map((c) => map.set(c.id, c))
      })
    )
  }, [_googleUserData])

  useEffect(() => {
    //if (swr.data && swr.data.size > 0) {
    ;(() => {
      const isReachingEnd = snapshots && snapshots[snapshots.length - 1]?.length < 10
      if (!isReachingEnd) {
        // Fetch until the end
        setSize(size + 1)
      } else {
        const map = Map<string, Teacher>().asMutable()
        const classroom = swr.data ?? Map()
        const processedGoogleIds = Set<string>().asMutable()
        snapshots.flat().map((data) => {
          // Check if user with the given id is exists in Google Classroom
          const meetings: Teacher['meetings'] = {
            id: data.meeting,
            code: data.code,
            url: data.url,
            type: data.meet ? 'meet' : 'zoom',
          }
          let processed = false
          const customGoogleData = googleUserData.get(data.id)
          if (customGoogleData && Array.isArray(customGoogleData.userId)) {
            customGoogleData.userId.map((id) => {
              if (!classroom.get(id)) return
              map.set(id, {
                ...classroom.get(id),
                meetings,
                displayName: data.name,
                source: 'google',
                subject: data.subject,
                localId: data.id,
              })
              processedGoogleIds.add(id)
              processed = true
            })
          }
          if (!processed) {
            map.set(data.id, {
              id: data.id,
              name: data.name,
              source: 'plugin',
              subject: data.subject,
              meetings,
            })
          }
        })
        const notAssigned = Map<string, Teacher>()
          .withMutations((map) =>
            Set(classroom.keys())
              .subtract(processedGoogleIds)
              .map((id) => {
                map.set(id, {
                  ...classroom.get(id),
                  source: 'google',
                })
              })
          )
          .sortBy((v) => v.displayName ?? v.name)
        setClassroom(notAssigned.concat(map.sortBy((v) => v.displayName ?? v.name)))
      }
    })()
    // Yes, we know the useEffect dependencies, but we should only listen based on the swr data fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swr.data, snapshots, googleUserData])

  return { ...swr, data: classroom }
}

export const useCourseWork = (courseId: string, contentId?: string) =>
  useAPIFetcherWithContent<CourseWork>(courseId && `/courses/${courseId}/courseWork`, contentId)

export const useSubmissions = (courseId: string, contentId?: string) =>
  useAPIFetcherWithContent<Submission>(
    courseId && `/courses/${courseId}/studentSubmissions`,
    contentId,
    'courseWorkId'
  )

export const useTopics = (courseId: string) =>
  useAPIFetcher<Topic>(courseId && `/courses/${courseId}/topics`, 'topicId')

export const useMaterials = (courseId: string, contentId?: string) =>
  useAPIFetcherWithContent<Material>(courseId && `/courses/${courseId}/materials`, contentId)

export const useAnnoucement = (courseId: string) =>
  useAPIFetcher<Announcement>(courseId && `/courses/${courseId}/announcements`)
