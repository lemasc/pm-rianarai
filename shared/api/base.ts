/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR from 'swr'
import { useAuth } from '../authContext'
import axios from 'axios'
import { Map } from 'immutable'
import { useEffect } from 'react'

/**
 * Converts the array response into a ImmutableMap based on ids.
 */
function mapIds<T extends Record<string, any>>(response: T[], mapKey?: keyof T): Map<string, T> {
  return Map<string, T>().withMutations((map) =>
    response.forEach((v) => map.set(v[mapKey ?? 'id'], v))
  )
}

export function fetchWithIdsMap<T extends Record<string, any>>(key: string, mapKey?: keyof T) {
  return axios.get<T[]>(key).then((res) => mapIds(res.data, mapKey))
}

export function useAPIFetcher<T>(key: string, mapKey?: keyof T) {
  const { metadata, ready } = useAuth()
  return useSWR(ready && metadata && key ? key : null, (key: string) =>
    fetchWithIdsMap<T>(key, mapKey)
  )
}

export function useAPIObjectFetcher<T>(key: string) {
  const { metadata, ready } = useAuth()
  return useSWR(ready && metadata && key ? key : null, (key: string) =>
    axios.get<T>(key).then((res) => res.data)
  )
}

export function useAPIFetcherWithContent<T extends Record<string, any>>(
  key: string,
  contentId?: string,
  mapKey?: keyof T
) {
  const swr = useAPIFetcher<T>(key, mapKey)
  const contentSwr = useSWR(
    swr.data && key && contentId ? [key, contentId] : null,
    async (key, contentId) => {
      if (key && swr.data && swr.data.get(contentId)) {
        const content = await axios.get<T>([key, contentId].join('/'))
        return Map<string, T>().set(contentId, {
          ...swr.data.get(contentId),
          ...content.data,
        })
      }
      return null
    }
  )
  useEffect(() => {
    if (swr.data && contentId) {
      contentSwr.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, swr.data, swr.mutate])
  return contentId ? contentSwr : swr
}
