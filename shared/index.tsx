import { ReactNode } from 'react'
import { FuegoProvider } from 'swr-firestore-v9'

import { useProvideAuth, authContext } from './authContext'
import { fuego } from './firebase'
import { SWRConfig, Cache, Key } from 'swr'
import { timeslotContext, useProvideTimeslot } from './timeslotContext'
import { Map as ImmutableMap } from 'immutable'
import { sendEvent, sendEventSync } from './native'

interface IProps {
  children: ReactNode
}

function AuthProvider({ children }: IProps): JSX.Element {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

function TimeslotProvider({ children }: IProps): JSX.Element {
  const timeslot = useProvideTimeslot()
  return <timeslotContext.Provider value={timeslot}>{children}</timeslotContext.Provider>
}

function cacheProvider() {
  if (typeof window === 'undefined') return new Map()
  return new CacheProvider()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class CacheProvider<Data = any> implements Cache<unknown> {
  _map: Map<Key, unknown>
  constructor() {
    this._map = new Map()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cache = sendEventSync<any[]>('cache-get')
    if (cache) {
      // We use for loop here for performance.
      for (let i = 0; i < cache.length; ++i) {
        if (!this._map.get(cache[i][0]))
          this._map.set(
            cache[i][0],
            Array.isArray(cache[i][1]) ? ImmutableMap(cache[i][1]) : cache[i][1]
          )
      }
    }
  }

  // Get function will return data from client-side directly.
  get(key: Key) {
    return this._map.get(key)
  }
  set(key: Key, value: Data) {
    this._map.set(key, value)
    sendEvent('cache-set', [key, value])
  }
  delete(key: Key) {
    if (this._map.delete(key)) {
      sendEvent('cache-delete', key)
    }
  }
}

export function MainProvider({ children }: IProps): JSX.Element {
  return (
    <AuthProvider>
      <SWRConfig value={{ dedupingInterval: 30 * 1000, focusThrottleInterval: 10 * 1000 }}>
        <FuegoProvider fuego={fuego}>
          <TimeslotProvider>{children}</TimeslotProvider>
        </FuegoProvider>
      </SWRConfig>
    </AuthProvider>
  )
}
